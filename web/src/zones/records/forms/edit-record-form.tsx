import { apiClient } from "@api/config";
import { fetcher } from "@api/index";
import { InsertRecordDto } from "@api/records/dto";
import { Record } from "@api/records/types";
import { LoadingCode, Template, Waste, WasteCompany } from "@api/templates/types";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Button } from "@shared/components/button/button";
import { Autocomplete } from "@shared/components/inputs/autocomplete";
import { DatePickerInput } from "@shared/components/inputs/date-picker";
import { Input } from "@shared/components/inputs/text-input";
import { useFormLeave } from "@shared/hooks/useFormLeave";
import { useUserSorting } from "@shared/hooks/useUserSorting";
import { formatDecimal } from "@shared/utils/validator/helpers";
import { Validator } from "@shared/utils/validator/validator";
import { useAuth } from "@zones/authorization/hooks/useAuth";
import { LeaveEditorModal } from "@zones/common/components/leave-editor-modal";
import dayjs from "dayjs";
import { isEqual } from "lodash";
import { useRouter } from "next/router";
import React, { FC, MouseEvent, useCallback, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

interface NewRecordFormValues {
	amount: string;
	date: Date | string;
	loadingCode: LoadingCode | null;
	template: Template | null;
	waste: Waste | null;
	wasteCompany: WasteCompany | null;
}

export type MassUnit = "kg" | "t";

const DEFAULT_VALUES: NewRecordFormValues = {
	amount: "",
	date: "",
	loadingCode: null,
	template: null,
	waste: null,
	wasteCompany: null,
};

function mapRecordValues(values: NewRecordFormValues, massUnit: MassUnit, recordId?: number): InsertRecordDto {
	const formattedAmount = parseFloat(formatDecimal(values.amount));
	const dayjsDate = dayjs(values.date);
	return {
		amount: massUnit === "t" ? formattedAmount : formattedAmount / 1000,
		date: dayjsDate.set("minute", dayjsDate.utcOffset()).toDate(),
		id: recordId ?? null,
		loadingCodeId: values.loadingCode?.id ?? 0,
		templateId: values.template?.id ?? 0,
		wasteId: values.waste?.id ?? 0,
		wasteCompanyId: values.wasteCompany?.id ?? null,
	};
}

function mapRecordToDefaultValues(record: Record, massUnit: MassUnit): NewRecordFormValues {
	return {
		amount: `${massUnit === "kg" ? record.amount * 1000 : record.amount}`,
		date: dayjs(record.date).toDate(),
		loadingCode: record.loadingCode,
		template: record.template,
		waste: record.waste,
		wasteCompany: record.wasteCompany ?? null,
	};
}

interface Props {
	templates: Template[];
	record?: Record;
}

export const EditRecordForm: FC<Props> = ({ templates, record }) => {
	const [user] = useAuth();
	const router = useRouter();
	const [userSorting, setUserSorting] = useUserSorting();
	const defaultValues = record ? mapRecordToDefaultValues(record, userSorting.massUnit) : DEFAULT_VALUES;
	const {
		control,
		formState: { isDirty, isSubmitting },
		handleSubmit,
		reset,
		watch,
		setValue,
	} = useForm<NewRecordFormValues>({ defaultValues, mode: "onChange" });

	const amount = watch("amount");
	const selectedTemplate = watch("template");
	const loadingCode = watch("loadingCode");

	const onSubmit = useCallback<SubmitHandler<NewRecordFormValues>>(
		async values => {
			if (!user?.accessToken) {
				return;
			}

			if (record?.id && isEqual(values, defaultValues)) {
				toast.error("Nebyly provedeny ????dn?? zm??ny");
				return;
			}

			const { error } = await fetcher<Record, InsertRecordDto>({
				axiosInstance: apiClient,
				method: "post",
				url: "/records/insert",
				accessToken: user.accessToken,
				data: mapRecordValues(values, userSorting.massUnit, record?.id),
			});

			if (error) {
				toast.error(`Nepoda??ilo se ${record ? "upravit" : "vytvo??it"} z??znam`);
				return;
			}

			await router.push("/records");
			toast.success(`Z??znam byl ??sp????n?? ${record ? "upraven" : "vytvo??en"}`);
		},
		[user?.accessToken, defaultValues, userSorting.massUnit, record, router]
	);
	const onExit = useCallback(() => router.back(), [router]);
	const onMassUnitChange = useCallback(
		(_: MouseEvent<HTMLElement>, value: string) => {
			const massUnit = value as MassUnit;
			if (massUnit === null) {
				return;
			}
			setUserSorting("massUnit", massUnit);

			if (!amount) {
				return;
			}
			setValue("amount", formatDecimal((massUnit === "kg" ? parseFloat(amount) * 1000 : parseFloat(amount) / 1000).toString()));
		},
		[amount, setUserSorting, setValue]
	);

	const [showModal, handleFormLeave] = useFormLeave(isDirty && !isSubmitting);

	useEffect(() => {
		if (!selectedTemplate) {
			reset();
		}
	}, [reset, selectedTemplate]);

	useEffect(() => {
		if (!loadingCode?.requireWasteCompany) {
			setValue("wasteCompany", null);
		}
	}, [setValue, loadingCode]);

	useEffect(() => {
		if (record) {
			setValue("amount", formatDecimal((userSorting.massUnit === "kg" ? record.amount * 1000 : record.amount).toString()));
		}
	}, [record, setValue, userSorting.massUnit]);

	return (
		<>
			<form noValidate onSubmit={handleSubmit(onSubmit)}>
				<div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
					<Autocomplete
						autocompleteProps={{
							disabled: !!record,
							getOptionLabel: (option: Template) => option.title,
							noOptionsText: "????dn?? ??ablona nebyla nalezena",
						}}
						control={control}
						label={record ? "Nelze zm??nit v??choz?? ??ablonu" : "Vyberte ??ablonu"}
						name="template"
						options={templates}
						required={!record}
					/>
					<DatePickerInput control={control} disabled={!selectedTemplate} label="Datum" name="date" required />
					<div className="relative">
						<Input
							className="w-full"
							control={control}
							disabled={!selectedTemplate}
							inputMode="numeric"
							label="Zadejte mno??stv??"
							name="amount"
							required
							rules={{
								maxLength: { value: 7, message: "Mno??stv?? m????e m??t maxim??ln?? 7 znak??" },
								pattern: { value: Validator.DECIMAL_REGEXP, message: "Pouze ??islo" },
								validate: value => Validator.onlyPositiveNumber(value as string),
							}}
						/>
						<ToggleButtonGroup
							className="absolute top-0 bottom-0 right-0 h-fit"
							disabled={!selectedTemplate}
							exclusive
							onChange={onMassUnitChange}
							orientation="vertical"
							value={userSorting.massUnit}
						>
							<ToggleButton className="rounded-l-none py-1 text-[0.66rem] lowercase" value="t">
								t
							</ToggleButton>
							<ToggleButton className="rounded-l-none py-1 text-[0.66rem] lowercase" value="kg">
								kg
							</ToggleButton>
						</ToggleButtonGroup>
					</div>
					<Autocomplete
						autocompleteProps={{
							disabled: !selectedTemplate,
							getOptionLabel: (option: Waste) => `${option.uid} (${option.category}) \u2013 ${option.name}`,
							noOptionsText: "??adn?? odpad nebyl nalezen",
						}}
						control={control}
						label="Vyberte odpad"
						name="waste"
						options={selectedTemplate?.wastes ?? []}
						required
					/>
					<Autocomplete
						autocompleteProps={{
							disabled: !selectedTemplate,
							getOptionLabel: (option: LoadingCode) => `${option.uid} \u2013 ${option.name}`,
							noOptionsText: "??adn?? zp??sob naklad??n?? nebyl nalezen",
						}}
						control={control}
						label="Vyberte zp??sob naklad??n??"
						name="loadingCode"
						options={selectedTemplate?.loadingCodes ?? []}
						required
					/>
					<Autocomplete
						autocompleteProps={{
							disabled: !selectedTemplate || !loadingCode?.requireWasteCompany,
							getOptionLabel: (option: WasteCompany) => option.name ?? `Ob??an?? obce ${option.territorialUnit.name}`,
							noOptionsText: "??adn?? opr??vn??n?? osoba nebyla nalezena",
						}}
						control={control}
						label={loadingCode?.requireWasteCompany ? "Vyberte opr??vn??nou osobu" : "Opr??vn??n?? osoba nen?? vy??adov??na"}
						name="wasteCompany"
						options={selectedTemplate?.wasteCompanies ?? []}
						required={loadingCode?.requireWasteCompany}
					/>
				</div>
				<div className="py-8">
					<div className="flex flex-col-reverse justify-end gap-6 md:flex-row">
						<Button onClick={onExit} variant="white">
							Zp??t
						</Button>
						<Button type="submit" variant="secondary">
							{record ? "Ulo??it zm??ny" : "Vytvo??it z??znam"}
						</Button>
					</div>
				</div>
			</form>
			<LeaveEditorModal isOpen={showModal} onClose={handleFormLeave(false)} onLeave={handleFormLeave(true)} />
		</>
	);
};
