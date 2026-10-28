import Image from "next/image";
import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Checkbox } from "@/components/ui";
import { formatPrice } from "@/utils/priceFormat";

interface PropertyData {
  id: string;
  title: string;
  type: string;
  price: string;
  location: string;
}

interface PropertyTableProps {
  data: PropertyData[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  selectedIds?: Set<string>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: string, checked: boolean) => void;
  isAllSelected?: boolean;
}

const DashboardTable: React.FC<PropertyTableProps> = ({
  data,
  onEdit = () => { },
  onDelete = () => { },
  isLoading = false,
  emptyMessage = "No records available.",
  selectedIds = new Set(),
  onSelectAll = () => { },
  onSelectOne = () => { },
  isAllSelected = false,
}) => {
  const cardClasses =
    "bg-white shadow-lg shadow-[#242424]/5 rounded-2xl overflow-hidden border border-[#D8D2C8]";

  return (
    <div className={cardClasses}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px] text-[#2B2B2B] table-fixed">
          <thead className="bg-[#FAF8F2] text-left text-sm font-semibold">
            <tr>
              <th className="px-3 py-2.5 w-12">
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  containerClassName="justify-center"
                />
              </th>

              <th className="px-3 py-2.5">Title</th>

              <th className="px-3 py-2.5 w-[120px]">
                Type
              </th>

              <th className="px-3 py-2.5 w-[130px]">
                Price
              </th>

              <th className="px-3 py-2.5">
                Location
              </th>

              <th className="px-3 py-2.5 w-[120px] text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="border-t border-[#D8D2C8] px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <LoadingSpinner text="Loading properties..." />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-[#2B2B2B]/50 border-b border-[#D8D2C8]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={`${row.id}-${index}`}
                  className="border-t border-[#D8D2C8] hover:bg-[#FAF8F2] transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onChange={(e) =>
                        onSelectOne(row.id, e.target.checked)
                      }
                      containerClassName="justify-center"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-[#242424]">
                      {row.title}
                    </p>
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {row.type}
                  </td>

                  <td className="px-4 py-3">
                    {formatPrice(row.price)}
                  </td>

                  <td className="px-4 py-3">
                    {row.location}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-nowrap">

                      {/* Edit */}
                      <button
                        onClick={() => onEdit(row.id)}
                        className="p-1.5 rounded-full hover:bg-[#C96A32]/10 text-[#242424] transition-colors flex-shrink-0"
                        aria-label="Edit"
                        title="Edit Property"
                      >
                        <Image
                          src="/icons/edit.svg"
                          width={18}
                          height={18}
                          alt="edit"
                        />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(row.id)}
                        className="p-1.5 rounded-full hover:bg-[#B03A2E]/10 text-[#B03A2E] transition-colors flex-shrink-0"
                        aria-label="Delete"
                        title="Delete Property"
                      >
                        <Image
                          src="/icons/delete.svg"
                          width={18}
                          height={18}
                          alt="delete"
                        />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardTable;