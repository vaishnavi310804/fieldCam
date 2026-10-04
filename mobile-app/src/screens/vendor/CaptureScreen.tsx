import { useState, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import {
  getProjectById,
  uploadProjectPhoto,
  VendorProjectItem,
  VendorChecklistItem,
  VendorProjectPhoto,
  AIValidationResult,
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
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhotoData | null>(null);

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

  // Photo Upload & AI Validation State
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [aiValidationResult, setAiValidationResult] =
    useState<AIValidationResult | null>(null);
  const [uploadedPhotoId, setUploadedPhotoId] = useState<string | null>(null);

  // Screen view mode: "category_select" or "camera"
  const [viewMode, setViewMode] = useState<"category_select" | "camera">(
    "category_select"
  );

  useEffect(() => {
    if (viewMode === "camera") {
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
    setCapturedPhoto(null);
    setUploadStatus("idle");
    setUploadError(null);
    setAiValidationResult(null);
    setViewMode("camera");
  };

  const handleCloseCamera = () => {
    setCapturedPhoto(null);
    setUploadStatus("idle");
    setUploadError(null);
    setAiValidationResult(null);
    setViewMode("category_select");
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

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

      // Capture Timestamp
      const capturedAt = new Date().toISOString();

      // Store Photo + Metadata
      setCapturedPhoto({
        uri: photo.uri,
        capturedAt,
        location: {
          latitude,
          longitude,
          accuracy,
        },
      });

      setUploadStatus("idle");
      setUploadError(null);
      setAiValidationResult(null);
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

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setUploadStatus("idle");
    setUploadError(null);
    setAiValidationResult(null);
  };

  const handleUploadPhoto = async () => {
    if (
      !capturedPhoto ||
      !selectedCategory ||
      !projectIdParam ||
      uploadStatus === "uploading"
    ) {
      return;
    }

    try {
      setUploadStatus("uploading");
      setUploadError(null);

      const response = await uploadProjectPhoto(projectIdParam, {
        photoUri: capturedPhoto.uri,
        checklistItemId: selectedCategory.id,
        capturedAt: capturedPhoto.capturedAt,
        latitude: capturedPhoto.location.latitude,
        longitude: capturedPhoto.location.longitude,
        accuracy: capturedPhoto.location.accuracy,
      });

      setUploadStatus("success");
      if (response.photo && response.photo._id) {
        setUploadedPhotoId(response.photo._id);
      }
      if (response.photo && response.photo.aiValidation) {
        setAiValidationResult(response.photo.aiValidation);
      } else {
        setAiValidationResult(null);
      }

      // Refresh project to update category checklist status
      fetchProjectData(false);
    } catch (err: any) {
      console.error("Upload photo error:", err);
      setUploadStatus("error");
      setUploadError(
        err?.message || "Failed to upload photo. Please check connection and try again."
      );
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

  const isCategoryCompleted = (item: VendorChecklistItem) => {
    const hasUploadedPhoto = photos.some(
      (p) => String(p.checklistItemId) === String(item.id)
    );
    return Boolean(item.checked || hasUploadedPhoto);
  };

  const isAllCategoriesCompleted =
    checklistItems.length > 0 &&
    checklistItems.every((item) => isCategoryCompleted(item));

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

  if (viewMode === "camera") {
    // Permission loading state
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

    // Permission denied state
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
        {/* Background Layer: Real Camera or Captured Photo Preview */}
        {capturedPhoto ? (
          <Image
            source={{ uri: capturedPhoto.uri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            flash={flash}
          />
        )}

        {/* Top Dark Header Bar */}
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

          {/* Centered Category Pill Badge */}
          <View style={styles.categoryPillBadge}>
            <Text style={styles.categoryPillText} numberOfLines={1}>
              {selectedCategory?.label || "Photo Requirement"}
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

        {/* Camera View Area & Overlays */}
        <View style={styles.cameraViewArea}>
          {/* Metadata Overlay Card (top-left) */}
          <View style={styles.metaOverlayCard}>
            <View style={styles.metaOverlayRow}>
              <Ionicons name="location-sharp" size={13} color="#10B981" />
              <Text style={styles.metaOverlayText} numberOfLines={1}>
                {capturedPhoto
                  ? `${capturedPhoto.location.latitude.toFixed(4)}°, ${capturedPhoto.location.longitude.toFixed(4)}° (±${capturedPhoto.location.accuracy}m)`
                  : project?.location || "Geotagged Location"}
              </Text>
            </View>

            <View style={styles.metaOverlayRow}>
              <Ionicons name="time-outline" size={13} color="#3B82F6" />
              <Text style={styles.metaOverlayText}>
                {formatTimestampDisplay(capturedPhoto?.capturedAt)}
              </Text>
            </View>

            <View style={styles.metaOverlayRow}>
              <Ionicons name="pricetag-outline" size={13} color="#9CA3AF" />
              <Text style={styles.metaOverlaySubtext}>
                {project?.projectId || "Project ID"}
              </Text>
            </View>
          </View>

          {/* Center Framing Guide Box */}
          <View style={styles.framingGuideBox} />

          {/* Bottom Controls Bar */}
          <View
            style={[
              styles.shutterControlsContainer,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            {capturedPhoto ? (
              /* Captured Photo Preview & Upload Controls */
              <View style={styles.previewControlsCol}>
                {uploadStatus === "uploading" ? (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.uploadingText}>
                      Uploading photo & analyzing with AI...
                    </Text>
                  </View>
                ) : uploadStatus === "success" ? (
                  <>
                    {/* AI Validation Status Badge */}
                    {aiValidationResult ? (
                      <View
                        style={[
                          styles.aiBadgeContainer,
                          aiValidationResult.status === "PASSED"
                            ? styles.aiBadgePassed
                            : aiValidationResult.status === "FAILED"
                            ? styles.aiBadgeFailed
                            : styles.aiBadgePending,
                        ]}
                      >
                        <View style={styles.aiBadgeHeader}>
                          <Ionicons
                            name={
                              aiValidationResult.status === "PASSED"
                                ? "checkmark-circle"
                                : aiValidationResult.status === "FAILED"
                                ? "close-circle"
                                : "time-sharp"
                            }
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.aiBadgeTitle}>
                            AI Validation: {aiValidationResult.status}
                          </Text>
                        </View>
                        {aiValidationResult.reason ||
                        aiValidationResult.subject?.reason ? (
                          <Text style={styles.aiBadgeReason} numberOfLines={2}>
                            {aiValidationResult.reason ||
                              aiValidationResult.subject?.reason}
                          </Text>
                        ) : null}
                      </View>
                    ) : (
                      <View
                        style={[styles.aiBadgeContainer, styles.aiBadgePassed]}
                      >
                        <View style={styles.aiBadgeHeader}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#FFFFFF"
                          />
                          <Text style={styles.aiBadgeTitle}>
                            Photo Uploaded Successfully
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.buttonRow}>
                      <Pressable
                        style={styles.primaryUploadButton}
                        onPress={() => {
                          router.push({
                            pathname: "/(app)/ai-verification",
                            params: {
                              projectId: projectIdParam,
                              photoId: uploadedPhotoId || "",
                              checklistItemId: selectedCategory?.id,
                              photoUri: capturedPhoto?.uri,
                            },
                          });
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="View AI Verification"
                      >
                        <Ionicons
                          name="sparkles"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.primaryUploadButtonText}>
                          View AI Verification
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.retakeButton}
                        onPress={handleCloseCamera}
                        accessibilityRole="button"
                        accessibilityLabel="Back to Categories"
                      >
                        <Ionicons
                          name="checkmark-sharp"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.retakeButtonText}>
                          Categories
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : uploadStatus === "error" ? (
                  <>
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={18} color="#FCA5A5" />
                      <Text style={styles.errorBoxText} numberOfLines={2}>
                        {uploadError || "Upload failed. Please try again."}
                      </Text>
                    </View>

                    <View style={styles.buttonRow}>
                      <Pressable
                        style={styles.primaryUploadButton}
                        onPress={handleUploadPhoto}
                        accessibilityRole="button"
                        accessibilityLabel="Retry Upload"
                      >
                        <Ionicons
                          name="cloud-upload-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.primaryUploadButtonText}>
                          Retry Upload
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.retakeButton}
                        onPress={handleRetakePhoto}
                        accessibilityRole="button"
                        accessibilityLabel="Retake Photo"
                      >
                        <Ionicons
                          name="refresh-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.retakeButtonText}>Retake</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.shutterTimerText}>
                      Photo Captured & Geotagged
                    </Text>

                    <View style={styles.buttonRow}>
                      <Pressable
                        style={styles.primaryUploadButton}
                        onPress={handleUploadPhoto}
                        accessibilityRole="button"
                        accessibilityLabel="Upload Photo"
                      >
                        <Ionicons
                          name="cloud-upload-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.primaryUploadButtonText}>
                          Upload Photo
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.retakeButton}
                        onPress={handleRetakePhoto}
                        accessibilityRole="button"
                        accessibilityLabel="Retake Photo"
                      >
                        <Ionicons
                          name="refresh-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.retakeButtonText}>Retake</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            ) : (
              /* Live Camera Capture Controls */
              <>
                <Text style={styles.shutterTimerText}>0 / 2 min</Text>

                <View style={styles.shutterRow}>
                  {/* Gallery Placeholder Icon */}
                  <View style={styles.cameraBottomIconButton}>
                    <Ionicons name="images-outline" size={22} color="#A39A94" />
                  </View>

                  {/* Main Shutter Button */}
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

                  {/* Camera Flip Button */}
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
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Category Selection View
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
              Tap a category to start capturing photos
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
                const isCompleted = isCategoryCompleted(item);

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.categoryCard,
                      isCompleted
                        ? styles.categoryCardCompleted
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
                        isCompleted
                          ? styles.iconCircleCompleted
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

                      {isCompleted ? (
                        <Text style={styles.completedSubtext}>
                          Photo captured
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

          {/* Continue to AI Verification CTA (renders when ALL required categories are complete) */}
          {isAllCategoriesCompleted ? (
            <View style={styles.continueButtonContainer}>
              <Pressable
                style={styles.continueButton}
                onPress={() => {
                  router.push({
                    pathname: "/(app)/ai-verification",
                    params: { projectId: project._id },
                  });
                }}
                accessibilityRole="button"
                accessibilityLabel="Continue to AI Verification"
              >
                <Text style={styles.continueButtonText}>
                  Continue to AI Verification
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  categoryCardCompleted: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
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
  iconCircleCompleted: {
    backgroundColor: "#10B981",
  },
  iconCirclePending: {
    backgroundColor: "#F3F4F6",
  },
  categoryTextCol: {
    flex: 1,
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
  },
  categoryLabelCompleted: {
    fontWeight: "700",
    color: "#15803D",
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
  completedSubtext: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16A34A",
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
  metaOverlaySubtext: {
    color: "#D1D5DB",
    fontSize: 10,
    fontWeight: "500",
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
  previewControlsCol: {
    alignItems: "center",
    width: "100%",
  },
  uploadingContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  uploadingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  aiBadgeContainer: {
    width: "100%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  aiBadgePassed: {
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    borderColor: "#10B981",
  },
  aiBadgeFailed: {
    backgroundColor: "rgba(239, 68, 68, 0.25)",
    borderColor: "#EF4444",
  },
  aiBadgePending: {
    backgroundColor: "rgba(245, 158, 11, 0.25)",
    borderColor: "#F59E0B",
  },
  aiBadgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiBadgeTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  aiBadgeReason: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(220, 38, 38, 0.3)",
    borderColor: "#EF4444",
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
    width: "100%",
  },
  errorBoxText: {
    color: "#FEE2E2",
    fontSize: 12,
    flex: 1,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  primaryUploadButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryUploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  retakeButton: {
    backgroundColor: "#374151",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  retakeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
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
});
