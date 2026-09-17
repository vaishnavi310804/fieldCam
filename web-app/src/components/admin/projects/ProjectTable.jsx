import ProjectStatusBadge from "./ProjectStatusBadge";
import { FiEye, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ProjectTable = ({ projects }) => {
  return (
    <div className="bg-white border border-[#E8E2DE] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col justify-between">
      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#F2EBE5] text-[10px] font-bold tracking-wider text-[#A39A94] uppercase bg-[#FAF8F6]">
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>PROJECT ID</span>
                  <span className="text-[8px] text-[#A39A94]">▼</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>PROPERTY ADDRESS</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>SERVICE TYPE</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>VENDOR</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>DUE DATE</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span>STATUS</span>
                  <span className="text-[8px] text-[#A39A94]">⇅</span>
                </div>
              </th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F4F2] text-xs">
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-[#FAF7F5] transition-colors"
                >
                  {/* Project ID */}
                  <td className="py-3.5 px-4 font-semibold text-[#3E3734]">
                    {project.id}
                  </td>

                  {/* Property Address */}
                  <td className="py-3.5 px-4 font-medium text-[#4A423F] max-w-[200px] truncate">
                    {project.address}
                  </td>

                  {/* Service Type */}
                  <td className="py-3.5 px-4 text-[#6E6763]">
                    {project.service}
                  </td>

                  {/* Vendor */}
                  <td className="py-3.5 px-4 font-semibold text-[#3E3734]">
                    {project.vendor}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 text-[#817B77]">
                    {project.dueDate}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <ProjectStatusBadge status={project.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="View"
                        className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-md hover:bg-[#EAE4DF] transition-colors"
                      >
                        <FiEye className="text-sm" />
                      </button>
                      <button
                        title="Edit"
                        className="text-[#817B77] hover:text-[#3E3734] p-1 rounded-md hover:bg-[#EAE4DF] transition-colors"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>
                      <button
                        title="Delete"
                        className="text-[#817B77] hover:text-[#C62828] p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-xs text-[#817B77]">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-6 py-4 border-t border-[#F2EBE5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#817B77] bg-[#FAF8F6]">
        <div>Showing 1–{projects.length} of 12 projects</div>

        <div className="flex items-center gap-1">
          <button
            aria-label="Previous Page"
            className="p-1.5 text-[#A39A94] hover:text-[#3E3734] rounded-lg transition-colors"
          >
            <FiChevronLeft className="text-sm" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-[#C8B5AC] text-[#3E3734] font-bold text-xs flex items-center justify-center">
            1
          </button>
          <button className="w-7 h-7 rounded-lg hover:bg-[#EAE4DF] text-[#817B77] font-medium text-xs flex items-center justify-center transition-colors">
            2
          </button>
          <button
            aria-label="Next Page"
            className="p-1.5 text-[#817B77] hover:text-[#3E3734] rounded-lg transition-colors"
          >
            <FiChevronRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;
