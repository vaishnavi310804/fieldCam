import { useState, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, CameraType, FlashMode, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import Colors from "@/src/constants/color";
import { PageHeader } from "@/src/components/navigation/PageHeader";
import { PhotoGridCard } from "@/src/components/preview/PhotoGridCard";
import {
  UploadProgressRow,
  UploadStatus,
} from "@/src/components/preview/UploadProgressRow";
import {
  getProjectById,
  uploadProjectPhoto,
  VendorProjectItem,
  VendorChecklistItem,
  VendorProjectPhoto,
} from "@/src/api/dashboard.api";

export interface CapturedPhotoData {
  uri: string;
  capturedAt: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface LocalCapturedPhoto {
  checklistItemId: string;
  categoryLabel: string;
  uri: string;
  capturedAt: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export function CaptureScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const projectIdParam = params.id;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Camera & Location permissions hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();

  // Real Camera state
  const cameraRef = useRef<CameraView | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Project & Categories state
  const [project, setProject] = useState<VendorProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selected checklist category state
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    label: string;
  } | null>(null);

  // Batch Session Photos State (Local photos taken in current session, pending upload)
  const [sessionPhotos, setSessionPhotos] = useState<LocalCapturedPhoto[]>([]);

  // Screen view mode: "category_select" | "camera" | "preview" | "uploading"
  const [viewMode, setViewMode] = useState<
    "category_select" | "camera" | "preview" | "uploading"
  >("category_select");

  // Batch Uploading Progress State
  const [uploadProgressMap, setUploadProgressMap] = useState<
    Record<string, { status: UploadStatus; error?: string }>
  >({});
  const [isBatchUploading, setIsBatchUploading] = useState<boolean>(false);

  useEffect(() => {
    if (viewMode === "camera" || viewMode === "uploading") {
      navigation.setOptions({ tabBarStyle: { display: "none" } });
    } else {
      navigation.setOptions({ tabBarStyle: undefined });
    }

    return () => {
      navigation.setOptions({ tabBarStyle: undefined });
    };
  }, [viewMode, navigation]);

  const fetchProjectData = useCallback(
    async (showLoading = true) => {
      if (!projectIdParam) {
        setError("No project ID specified.");
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) setIsLoading(true);
        setError(null);

        const fetchedProject = await getProjectById(projectIdParam);
        setProject(fetchedProject);
      } catch (err: any) {
        console.error("Failed to fetch project details for capture:", err);
        setError(err?.message || "Failed to load project photo categories.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [projectIdParam]
  );

  useEffect(() => {
    fetchProjectData(true);
  }, [fetchProjectData]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProjectData(false);
  }, [fetchProjectData]);

  const handleCategorySelect = (item: VendorChecklistItem) => {
    setSelectedCategory({ id: item.id, label: item.label });
    setViewMode("camera");
  };

  const handleCloseCamera = () => {
    setViewMode("category_select");
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || isCapturing || !selectedCategory) return;

    try {
      setIsCapturing(true);

      // Check / Request Location Permission
      let perm = locationPermission;
      if (!perm || !perm.granted) {
        const reqRes = await requestLocationPermission();
        perm = reqRes;
      }

      if (!perm || !perm.granted) {
        Alert.alert(
          "Location Permission Required",
          "FieldCam requires GPS coordinates to verify inspection photos at the job site. Please enable location permissions to capture photos."
        );
        setIsCapturing(false);
        return;
      }

      // Acquire Current GPS Position
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const latitude = locationResult.coords.latitude;
      const longitude = locationResult.coords.longitude;
      const rawAccuracy = locationResult.coords.accuracy ?? 0;
      const accuracy = Math.round(rawAccuracy * 10) / 10;

      // Capture Photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo || !photo.uri) {
        throw new Error("Camera did not return a valid photo URI.");
      }

      const capturedAt = new Date().toISOString();

      const newSessionPhoto: LocalCapturedPhoto = {
        checklistItemId: selectedCategory.id,
        categoryLabel: selectedCategory.label,
        uri: photo.uri,
        capturedAt,
        location: {
          latitude,
          longitude,
          accuracy,
        },
      };

      // Add or replace photo for this category in local session photos
      setSessionPhotos((prev) => {
        const filtered = prev.filter(
          (p) => String(p.checklistItemId) !== String(selectedCategory.id)
        );
        return [...filtered, newSessionPhoto];
      });

      // Automatically return to Category Selection view after taking photo
      setViewMode("category_select");
    } catch (err: any) {
      console.error("Camera capture or GPS acquisition failed:", err);
      Alert.alert(
        "Capture Error",
        err?.message ||
          "Failed to capture photo and GPS coordinates. Please ensure GPS is enabled and try again."
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDeleteSessionPhoto = (checklistItemId: string) => {
    setSessionPhotos((prev) =>
      prev.filter((p) => String(p.checklistItemId) !== String(checklistItemId))
    );
  };

  const handleStartBatchUpload = async () => {
    if (!projectIdParam || sessionPhotos.length === 0 || isBatchUploading) return;

    setIsBatchUploading(true);
    setViewMode("uploading");

    // Initialize progress map
    const initialMap: Record<string, { status: UploadStatus; error?: string }> = {};
    sessionPhotos.forEach((p) => {
      initialMap[p.checklistItemId] = { status: "pending" };
    });
    setUploadProgressMap(initialMap);

    let hasFailure = false;

    for (const item of sessionPhotos) {
      setUploadProgressMap((prev) => ({
        ...prev,
        [item.checklistItemId]: { status: "uploading" },
      }));

      try {
        await uploadProjectPhoto(projectIdParam, {
          photoUri: item.uri,
          checklistItemId: item.checklistItemId,
          capturedAt: item.capturedAt,
          latitude: item.location.latitude,
          longitude: item.location.longitude,
          accuracy: item.location.accuracy,
        });

        setUploadProgressMap((prev) => ({
          ...prev,
          [item.checklistItemId]: { status: "uploaded" },
        }));
      } catch (err: any) {
        console.error(`Upload failed for category ${item.categoryLabel}:`, err);
        hasFailure = true;
        setUploadProgressMap((prev) => ({
          ...prev,
          [item.checklistItemId]: {
            status: "failed",
            error: err?.message || "Failed to upload photo.",
          },
        }));
      }
    }

    setIsBatchUploading(false);

    // If ALL uploads succeeded, clear session and navigate to AI verification
    if (!hasFailure) {
      setSessionPhotos([]);
      await fetchProjectData(false);
      router.push({
        pathname: "/(app)/ai-verification",
        params: { projectId: projectIdParam },
      });
    }
  };

  const handleRetrySingleUpload = async (photoItem: LocalCapturedPhoto) => {
    if (!projectIdParam) return;

    setUploadProgressMap((prev) => ({
      ...prev,
      [photoItem.checklistItemId]: { status: "uploading" },
    }));

    try {
      await uploadProjectPhoto(projectIdParam, {
        photoUri: photoItem.uri,
        checklistItemId: photoItem.checklistItemId,
        capturedAt: photoItem.capturedAt,
        latitude: photoItem.location.latitude,
        longitude: photoItem.location.longitude,
        accuracy: photoItem.location.accuracy,
      });

      setUploadProgressMap((prev) => {
        const nextMap = {
          ...prev,
          [photoItem.checklistItemId]: { status: "uploaded" as UploadStatus },
        };

        // Check if all photos in session are now uploaded
        const allDone = sessionPhotos.every(
          (p) => nextMap[p.checklistItemId]?.status === "uploaded"
        );

        if (allDone) {
          setSessionPhotos([]);
          fetchProjectData(false).then(() => {
            router.push({
              pathname: "/(app)/ai-verification",
              params: { projectId: projectIdParam },
            });
          });
        }

        return nextMap;
      });
    } catch (err: any) {
      setUploadProgressMap((prev) => ({
        ...prev,
        [photoItem.checklistItemId]: {
          status: "failed",
          error: err?.message || "Failed to upload photo.",
        },
      }));
    }
  };

  const statusUpper = (project?.status || "").toUpperCase();
  const isInProgress = statusUpper === "IN PROGRESS";

  const checklistItems: VendorChecklistItem[] = Array.isArray(
    project?.checklistItems
  )
    ? project!.checklistItems
    : [];

  const photos: VendorProjectPhoto[] = Array.isArray(project?.photos)
    ? project!.photos
    : [];

  const isCategoryUploaded = (item: VendorChecklistItem) => {
    return Boolean(
      item.checked || photos.some((p) => String(p.checklistItemId) === String(item.id))
    );
  };

  const isCategoryCapturedInSession = (item: VendorChecklistItem) => {
    return sessionPhotos.some((p) => String(p.checklistItemId) === String(item.id));
  };

  const isCategoryCompleted = (item: VendorChecklistItem) => {
    return isCategoryUploaded(item) || isCategoryCapturedInSession(item);
  };

  const isAllCategoriesCompleted =
    checklistItems.length > 0 &&
    checklistItems.every((item) => isCategoryCompleted(item));

  const isAllRequiredPhotosUploaded =
    checklistItems.length > 0 &&
    checklistItems.every((item) => isCategoryUploaded(item));

  const isProjectSubmitted =
    statusUpper === "SUBMITTED" || statusUpper === "COMPLETED";

  const canViewAIVerification =
    isAllRequiredPhotosUploaded && !isProjectSubmitted;

  const formatTimestampDisplay = (dateString?: string) => {
    const d = dateString ? new Date(dateString) : new Date();
    if (isNaN(d.getTime())) return dateString || "";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // --------------------------------------------------------------------------
  // CAMERA VIEW MODE
  // --------------------------------------------------------------------------
  if (viewMode === "camera") {
    if (!cameraPermission) {
      return (
        <View style={styles.cameraScreenContainer}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.cameraLoadingText}>
              Checking camera permissions...
            </Text>
          </View>
        </View>
      );
    }

    if (!cameraPermission.granted) {
      return (
        <View style={styles.cameraScreenContainer}>
          <View style={styles.centerContainer}>
            <Ionicons name="camera-outline" size={54} color="#EF4444" />
            <Text style={styles.permissionTitle}>
              Camera Permission Required
            </Text>
            <Text style={styles.permissionSubtext}>
              FieldCam requires access to your device camera to capture job site inspection photos.
            </Text>
            {cameraPermission.canAskAgain ? (
              <Pressable
                style={styles.primaryButton}
                onPress={requestCameraPermission}
              >
                <Text style={styles.primaryButtonText}>Grant Permission</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.secondaryButton}
              onPress={handleCloseCamera}
            >
              <Text style={styles.secondaryButtonText}>
                Back to Category Selection
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.cameraScreenContainer}>
        {/* Real Camera View */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          flash={flash}
        />

        {/* Top Header Bar */}
        <View
          style={[
            styles.cameraHeaderBar,
            { paddingTop: Math.max(insets.top, 20) },
          ]}
        >
          <Pressable
            style={styles.cameraIconButton}
            onPress={handleCloseCamera}
            accessibilityRole="button"
            accessibilityLabel="Close Camera"
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>

          {/* Centered Category Badge */}
          <View style={styles.categoryPillBadge}>
            <Text style={styles.categoryPillText} numberOfLines={1}>
              {selectedCategory?.label || "Photo Category"}
            </Text>
          </View>

          {/* Flash Toggle */}
          <Pressable
            style={[
              styles.cameraIconButton,
              flash === "on" && styles.activeIconButton,
            ]}
            onPress={toggleFlash}
            accessibilityRole="button"
            accessibilityLabel="Toggle Flash"
          >
            <Ionicons
              name={flash === "on" ? "flash" : "flash-off-outline"}
              size={20}
              color={flash === "on" ? "#FBBF24" : "#FFFFFF"}
            />
          </Pressable>
        </View>

        {/* Framing Area & Meta Overlay */}
        <View style={styles.cameraViewArea}>
          <View style={styles.metaOverlayCard}>
            <View style={styles.metaOverlayRow}>
              <Ionicons name="location-sharp" size={13} color="#10B981" />
              <Text style={styles.metaOverlayText} numberOfLines={1}>
                {project?.location || "Geotagged Location"}
              </Text>
            </View>

            <View style={styles.metaOverlayRow}>
              <Ionicons name="time-outline" size={13} color="#3B82F6" />
              <Text style={styles.metaOverlayText}>
                {formatTimestampDisplay()}
              </Text>
            </View>
          </View>

          <View style={styles.framingGuideBox} />

          {/* Bottom Shutter Controls */}
          <View
            style={[
              styles.shutterControlsContainer,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <Text style={styles.shutterTimerText}>Position subject inside frame</Text>

            <View style={styles.shutterRow}>
              <View style={styles.cameraBottomIconButton}>
                <Ionicons name="images-outline" size={22} color="#A39A94" />
              </View>

              <Pressable
                style={[
                  styles.shutterOuterRing,
                  isCapturing && styles.disabledShutter,
                ]}
                onPress={handleTakePicture}
                disabled={isCapturing}
                accessibilityRole="button"
                accessibilityLabel="Capture Photo"
              >
                {isCapturing ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <View style={styles.shutterInnerCircle} />
                )}
              </Pressable>

              <Pressable
                style={styles.cameraBottomIconButton}
                onPress={toggleCameraFacing}
                accessibilityRole="button"
                accessibilityLabel="Flip Camera"
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // UPLOAD PROGRESS VIEW MODE
  // --------------------------------------------------------------------------
  if (viewMode === "uploading") {
    const totalCount = sessionPhotos.length;
    const completedCount = sessionPhotos.filter(
      (p) => uploadProgressMap[p.checklistItemId]?.status === "uploaded"
    ).length;
    const failedCount = sessionPhotos.filter(
      (p) => uploadProgressMap[p.checklistItemId]?.status === "failed"
    ).length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <View style={styles.screenContainer}>
        <PageHeader
          title="Uploading Photos"
          showBackButton={!isBatchUploading}
          onBackPress={() => setViewMode("preview")}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Upload Banner Card */}
          <View style={styles.uploadProgressCard}>
            <Text style={styles.uploadProgressCardTitle}>
              {failedCount > 0
                ? "Upload Encountered Errors"
                : isBatchUploading
                ? "Uploading Photos..."
                : "Upload Complete"}
            </Text>

            <Text style={styles.uploadProgressCardSubtext}>
              {completedCount} of {totalCount} photos uploaded
            </Text>

            {/* Progress Bar Container */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                    backgroundColor: failedCount > 0 ? "#EF4444" : Colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          {/* List of Photos with Individual Upload Status */}
          <Text style={styles.sectionHeaderTitle}>Photo Upload Status</Text>

          <View style={{ marginBottom: 20 }}>
            {sessionPhotos.map((item) => {
              const statusInfo = uploadProgressMap[item.checklistItemId] || {
                status: "pending" as UploadStatus,
              };

              return (
                <UploadProgressRow
                  key={item.checklistItemId}
                  categoryLabel={item.categoryLabel}
                  imageUri={item.uri}
                  status={statusInfo.status}
                  errorMessage={statusInfo.error}
                  onRetry={() => handleRetrySingleUpload(item)}
                />
              );
            })}
          </View>

          {/* Failure Banner & Action Buttons */}
          {failedCount > 0 && !isBatchUploading ? (
            <View style={styles.failedActionsContainer}>
              <View style={styles.errorNoticeBox}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorNoticeText}>
                  Some photos failed to upload. Please check your connection and retry.
                </Text>
              </View>

              <Pressable
                style={styles.retryAllButton}
                onPress={handleStartBatchUpload}
                accessibilityRole="button"
                accessibilityLabel="Retry Failed Uploads"
              >
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.retryAllButtonText}>Retry Failed Uploads</Text>
              </Pressable>

              <Pressable
                style={styles.backToPreviewButton}
                onPress={() => setViewMode("preview")}
                accessibilityRole="button"
                accessibilityLabel="Back to Photo Preview"
              >
                <Text style={styles.backToPreviewButtonText}>Back to Review</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // PHOTO PREVIEW VIEW MODE (2-Column Grid)
  // --------------------------------------------------------------------------
  if (viewMode === "preview") {
    const uncapturedItems = checklistItems.filter(
      (item) => !isCategoryCompleted(item)
    );

    return (
      <View style={styles.screenContainer}>
        <PageHeader
          title="Review Photos"
          showBackButton={true}
          onBackPress={() => setViewMode("category_select")}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner info */}
          <View style={styles.previewInfoCard}>
            <View>
              <Text style={styles.previewInfoTitle}>
                {sessionPhotos.length + photos.length} Photos Captured
              </Text>
              <Text style={styles.previewInfoSubtext}>
                Project: {project?.projectName || project?.projectId || "Inspection"}
              </Text>
            </View>
            <View style={styles.previewCountBadge}>
              <Text style={styles.previewCountBadgeText}>
                {sessionPhotos.length} Pending Upload
              </Text>
            </View>
          </View>

          {/* 2-Column Photo Grid */}
          <View style={styles.gridContainer}>
            {checklistItems.map((item) => {
              const sessionPhoto = sessionPhotos.find(
                (p) => String(p.checklistItemId) === String(item.id)
              );
              const backendPhoto = photos.find(
                (p) => String(p.checklistItemId) === String(item.id)
              );

              if (sessionPhoto) {
                return (
                  <PhotoGridCard
                    key={item.id}
                    type="photo"
                    imageUri={sessionPhoto.uri}
                    categoryLabel={item.label}
                    isBackendUploaded={false}
                    onRetake={() => {
                      setSelectedCategory({ id: item.id, label: item.label });
                      setViewMode("camera");
                    }}
                    onDelete={() => handleDeleteSessionPhoto(item.id)}
                  />
                );
              }

              if (backendPhoto) {
                return (
                  <PhotoGridCard
                    key={item.id}
                    type="photo"
                    imageUri={backendPhoto.url}
                    categoryLabel={item.label}
                    isBackendUploaded={true}
                    onRetake={() => {
                      setSelectedCategory({ id: item.id, label: item.label });
                      setViewMode("camera");
                    }}
                  />
                );
              }

              return null;
            })}

            {/* Add More Card if there are remaining checklist categories */}
            {uncapturedItems.length > 0 ? (
              <PhotoGridCard
                type="add_more"
                onAddMore={() => setViewMode("category_select")}
              />
            ) : null}
          </View>

          {/* Bottom Action Bar */}
          <View style={styles.previewActionsContainer}>
            {sessionPhotos.length > 0 ? (
              <Pressable
                style={styles.continueButton}
                onPress={handleStartBatchUpload}
                accessibilityRole="button"
                accessibilityLabel="Upload Photos"
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.continueButtonText}>Upload Photos</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={styles.secondaryActionButton}
              onPress={() => setViewMode("category_select")}
              accessibilityRole="button"
              accessibilityLabel="Add More Photos"
            >
              <Ionicons name="camera-outline" size={18} color="#374151" />
              <Text style={styles.secondaryActionButtonText}>Add More Photos</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // CATEGORY SELECTION VIEW MODE (Default)
  // --------------------------------------------------------------------------
  const capturedPhotosCount = checklistItems.filter((item) =>
    isCategoryCompleted(item)
  ).length;

  return (
    <View style={styles.screenContainer}>
      <PageHeader
        title="Select Category"
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      {isLoading && !isRefreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading photo categories...</Text>
        </View>
      ) : error || !project ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={40} color="#DC2626" />
          <Text style={styles.errorText}>{error || "Project not found"}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => fetchProjectData(true)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : !isInProgress ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#D97706" />
          <Text style={styles.blockedTitle}>Photo Capture Blocked</Text>
          <Text style={styles.blockedSubtext}>
            Photo capture is allowed only when project status is &quot;In
            Progress&quot;. Current status is &quot;{project.status}&quot;.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>
              Return to Project Details
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* Top Instruction Banner */}
          <View style={styles.instructionBanner}>
            <Ionicons name="camera-outline" size={18} color="#2563EB" />
            <Text style={styles.instructionBannerText}>
              Tap a category to capture photos. Review & upload when ready.
            </Text>
          </View>

          {/* Checklist Category Options */}
          {checklistItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="list-outline" size={32} color="#A39A94" />
              <Text style={styles.emptyCardText}>
                No photo categories available for this project.
              </Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {checklistItems.map((item) => {
                const isUploaded = isCategoryUploaded(item);
                const isSessionCaptured = isCategoryCapturedInSession(item);
                const isCompleted = isUploaded || isSessionCaptured;

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.categoryCard,
                      isUploaded
                        ? styles.categoryCardUploaded
                        : isSessionCaptured
                        ? styles.categoryCardSession
                        : styles.categoryCardPending,
                    ]}
                    onPress={() => handleCategorySelect(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select category ${item.label}`}
                  >
                    {/* Left Circular Icon */}
                    <View
                      style={[
                        styles.iconCircleBase,
                        isUploaded
                          ? styles.iconCircleUploaded
                          : isSessionCaptured
                          ? styles.iconCircleSession
                          : styles.iconCirclePending,
                      ]}
                    >
                      <Ionicons
                        name={isCompleted ? "checkmark" : "camera-outline"}
                        size={18}
                        color={isCompleted ? "#FFFFFF" : "#6B7280"}
                      />
                    </View>

                    {/* Middle Title & Badges Col */}
                    <View style={styles.categoryTextCol}>
                      <View style={styles.labelRow}>
                        <Text
                          style={[
                            styles.categoryLabel,
                            isCompleted && styles.categoryLabelCompleted,
                          ]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                        <View style={styles.requiredTag}>
                          <Text style={styles.requiredTagText}>Required</Text>
                        </View>
                      </View>

                      {isUploaded ? (
                        <Text style={styles.uploadedSubtext}>Photo uploaded</Text>
                      ) : isSessionCaptured ? (
                        <Text style={styles.sessionSubtext}>
                          Photo captured (Pending upload)
                        </Text>
                      ) : null}
                    </View>

                    {/* Right Chevron Arrow */}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isCompleted ? "#A1A1AA" : "#D1D5DB"}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Bottom Action Buttons (Review Photos / View AI Verification) */}
          {sessionPhotos.length > 0 || isAllCategoriesCompleted ? (
            <View style={styles.continueButtonContainer}>
              <Pressable
                style={styles.continueButton}
                onPress={() => setViewMode("preview")}
                accessibilityRole="button"
                accessibilityLabel="Review Photos"
              >
                <Text style={styles.continueButtonText}>
                  Review Photos ({capturedPhotosCount}/{checklistItems.length})
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : null}

          {/* View AI Verification Action (shown when all required photos are uploaded on backend) */}
          {canViewAIVerification ? (
            <View style={styles.viewAIVerificationContainer}>
              <Pressable
                style={styles.viewAIVerificationButton}
                onPress={() => {
                  router.push({
                    pathname: "/(app)/ai-verification",
                    params: { projectId: project._id },
                  });
                }}
                accessibilityRole="button"
                accessibilityLabel="View AI Verification"
              >
                <Text style={styles.viewAIVerificationButtonText}>
                  View AI Verification
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#2563EB" />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

export default CaptureScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingBottom:100,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#817B77",
  },
  errorText: {
    marginVertical: 12,
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#92400E",
    marginTop: 12,
    marginBottom: 8,
  },
  blockedSubtext: {
    fontSize: 14,
    color: "#78350F",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#374151",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  instructionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  instructionBannerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
    flex: 1,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE4DF",
  },
  emptyCardText: {
    marginTop: 8,
    fontSize: 14,
    color: "#817B77",
    textAlign: "center",
  },
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  categoryCardUploaded: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  categoryCardSession: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  categoryCardPending: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  iconCircleBase: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCircleUploaded: {
    backgroundColor: "#10B981",
  },
  iconCircleSession: {
    backgroundColor: "#2563EB",
  },
  iconCirclePending: {
    backgroundColor: "#F3F4F6",
  },
  categoryTextCol: {
    flex: 1,
    marginRight: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#18181B",
    flexShrink: 1,
  },
  categoryLabelCompleted: {
    fontWeight: "700",
  },
  requiredTag: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
  },
  uploadedSubtext: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16A34A",
    marginTop: 2,
  },
  sessionSubtext: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563EB",
    marginTop: 2,
  },

  /* Camera Screen Styles */
  cameraScreenContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  cameraLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#D1D5DB",
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  permissionSubtext: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  cameraHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 10,
  },
  cameraIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  activeIconButton: {
    backgroundColor: "rgba(251, 191, 36, 0.25)",
    borderColor: "#FBBF24",
  },
  categoryPillBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: "60%",
  },
  categoryPillText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  cameraViewArea: {
    flex: 1,
    justifyContent: "space-between",
    position: "relative",
  },
  metaOverlayCard: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 10,
    gap: 5,
    maxWidth: 240,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    zIndex: 5,
  },
  metaOverlayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaOverlayText: {
    color: "#F3F4F6",
    fontSize: 11,
    fontWeight: "600",
  },
  framingGuideBox: {
    width: 270,
    height: 270,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 18,
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: "auto",
  },
  shutterControlsContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  shutterTimerText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 16,
  },
  shutterRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraBottomIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterOuterRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  disabledShutter: {
    opacity: 0.6,
  },
  shutterInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
  },

  /* Preview Grid View Styles */
  previewInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewInfoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  previewInfoSubtext: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  previewCountBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  previewCountBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  previewActionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryActionButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },

  /* Uploading View Styles */
  uploadProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadProgressCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  uploadProgressCardSubtext: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  failedActionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  errorNoticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorNoticeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#991B1B",
    flex: 1,
  },
  retryAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryAllButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  backToPreviewButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  backToPreviewButtonText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Buttons */
  continueButtonContainer: {
    marginTop: 20,
    marginBottom: 8,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  viewAIVerificationContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  viewAIVerificationButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  viewAIVerificationButtonText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
});
