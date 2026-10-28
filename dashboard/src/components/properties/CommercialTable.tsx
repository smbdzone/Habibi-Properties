import Image from "next/image";
import React from "react";
import { Checkbox } from "@/components/ui";

interface PropertyData {
  id: string;
  title: string;
  type: string;
  price: string;
  location: string;
  bedrooms: number;
  dateAdded: string;
  area: string;
  slug?: string;
}

interface PropertyTableProps {
  data: PropertyData[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  selectedIds?: Set<string>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: string, checked: boolean) => void;
  isAllSelected?: boolean;
}

const cardClasses =
  "bg-white shadow-lg shadow-[#002F45]/5 rounded-2xl overflow-hidden border border-[#002F45]/5";

const CommercialTable: React.FC<PropertyTableProps> = ({
  data,
  onEdit = () => { },
  onDelete = () => { },
  onView = () => { },
  selectedIds = new Set(),
  onSelectAll = () => { },
  onSelectOne = () => { },
  isAllSelected = false,
}) => {
  return (
    <div className={cardClasses}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[14px] text-[#01364C] table-fixed">
          <thead className="bg-[#F4FBFD] text-left text-sm font-semibold">
            <tr>
              <th className="px-3 py-2.5 w-12">
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  containerClassName="justify-center"
                />
              </th>
              <th className="px-3 py-2.5">Title</th>
              <th className="px-3 py-2.5 w-[120px]">Type</th>
              <th className="px-3 py-2.5 w-[100px]">Bedrooms</th>
              <th className="px-3 py-2.5 w-[130px]">Area (Sq ft)</th>
              <th className="px-3 py-2.5 w-[130px]">Price</th>
              <th className="px-3 py-2.5 w-[130px]">Date Added</th>
              <th className="px-3 py-2.5 w-[120px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row, index) => (
              <tr
                key={`${row.id}-${index}`}
                className="border-t border-[#002F45]/10 hover:bg-[#F8FCFD]"
              >
                <td className="px-3 py-2.5">
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onChange={(e) => onSelectOne(row.id, e.target.checked)}
                    containerClassName="justify-center"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#002F45]">{row.title}</p>
                </td>
                <td className="px-4 py-3 capitalize">{row.type}</td>
                <td className="px-4 py-3">{row.bedrooms}</td>
                <td className="px-4 py-3">{row.area}</td>
                <td className="px-4 py-3">{row.price}</td>
                <td className="px-4 py-3">{row.dateAdded}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                    <button
                      onClick={() => onView(row.id)}
                      className="p-1.5 rounded-full hover:bg-[#002F45]/10 text-[#002F45] transition-colors flex-shrink-0"
                      aria-label="View"
                      title="View Details"
                    >
                      <Image src="/icons/eye.svg" width={18} height={18} alt="view" />
                    </button>
                    <button
                      onClick={() => onEdit(row.id)}
                      className="p-1.5 rounded-full hover:bg-[#002F45]/10 text-[#002F45] transition-colors flex-shrink-0"
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
                    <button
                      onClick={() => onDelete(row.id)}
                      className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition-colors flex-shrink-0"
                      aria-label="Delete"
                      title="Delete"
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommercialTable;

