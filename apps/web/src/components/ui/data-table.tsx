"use client";

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns: _columns,
  data: _data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const columns = useMemo(() => _columns, [_columns]);
  const data = useMemo(() => _data, [_data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: false,
    defaultColumn: {
      minSize: 0,
      size: 0,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.columnDef.size;
                const style = columnSize
                  ? { width: typeof columnSize === "number" ? `${columnSize}%` : columnSize }
                  : { width: "auto" };

                return (
                  <TableHead key={header.id} style={style}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => {
                  const columnSize = cell.column.columnDef.size;
                  const style = columnSize
                    ? { width: typeof columnSize === "number" ? `${columnSize}%` : columnSize }
                    : { width: "auto" };

                  return (
                    <TableCell key={cell.id} style={style}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
