import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const ManagementTable = ({
  title,
  columns,
  rows,
  actionLabel = "View",
  loading = false,
  onAction,
}) => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 px-5 pb-3 pt-5">
        <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
        {typeof onAction === "function" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAction}
            className="text-xs"
          >
            {actionLabel}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="text-xs font-bold uppercase tracking-wider text-slate-400 first:pl-5"
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-10 text-center text-sm text-slate-400"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIndex) => (
                  <TableRow
                    key={row._id ?? row.id ?? `${rowIndex}-${String(row[columns[0]?.key] ?? "row")}`}
                    className="hover:bg-slate-50/50"
                  >
                    {columns.map((col, colIndex) => (
                      <TableCell
                        key={col.key}
                        className={
                          colIndex === 0
                            ? "pl-5 font-semibold text-slate-800"
                            : "text-slate-600"
                        }
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManagementTable;
