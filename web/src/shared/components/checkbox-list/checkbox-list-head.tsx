import { Checkbox, TableCell, TableHead as MuiTableHead, TableRow, TableSortLabel } from "@mui/material";
import clsx from "clsx";
import React, { ChangeEventHandler } from "react";
import { HeadCell, Order } from "./types";

interface EnhancedTableHeadProps<T> {
	headCells: HeadCell<T>[];
	isError?: boolean;
	numSelected: number;
	onSelectAllClick: ChangeEventHandler<HTMLInputElement>;
	onSortClick: (property: keyof T) => () => void;
	order: Order;
	orderBy: keyof T;
	rowCount: number;
}

export const CheckboxHead = <T extends Record<string, any>>(props: EnhancedTableHeadProps<T>) => {
	const { headCells, isError, onSelectAllClick, order, orderBy, numSelected, rowCount, onSortClick } = props;

	return (
		<MuiTableHead>
			<TableRow>
				<TableCell padding="checkbox">
					<Checkbox
						checked={rowCount > 0 && numSelected === rowCount}
						className={clsx(isError && "text-red")}
						indeterminate={numSelected > 0 && numSelected < rowCount}
						onChange={onSelectAllClick}
					/>
				</TableCell>
				{headCells.map(({ id, label, width }) => (
					<TableCell key={id.toString()} sortDirection={orderBy === id ? order : false} sx={{ width: width }}>
						<TableSortLabel active={orderBy === id} direction={orderBy === id ? order : "asc"} onClick={onSortClick(id)}>
							<span className="font-medium uppercase">{label}</span>
							{orderBy === id ? <span className="sr-only">{order === "desc" ? "sorted descending" : "sorted ascending"}</span> : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</MuiTableHead>
	);
};