import { apiClient } from "@api/config";
import { fetcher } from "@api/index";
import { CataloguesDto, TemplateDTO } from "@api/templates/dto";
import { Template, TerritorialUnit, Zipcode } from "@api/templates/types";
import { Divider } from "@mui/material";
import { Button } from "@shared/components/button/button";
import { Autocomplete } from "@shared/components/inputs/autocomplete";
import { Input } from "@shared/components/inputs/text-input";
import { useFormLeave } from "@shared/hooks/useFormLeave";
import { Validator } from "@shared/utils/validator/validator";
import { useAuth } from "@zones/authorization/hooks/useAuth";
import { LeaveEditorModal } from "@zones/common/components/leave-editor-modal";
import { mapTemplateValues } from "@zones/templates/forms/mapper";
import { NewTemplateFormSection } from "@zones/templates/forms/new-template-form-section";
import { newTemplateFormDefaultValues, NewTemplateFormValues, wasteCompanyDefaultValue } from "@zones/templates/forms/types";
import clsx from "clsx";
import { useRouter } from "next/router";
import React, { memo, useCallback } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { LoadingCodesSectionTable } from "./sections/loading-codes-section-table";
import { WasteCompaniesArray } from "./sections/waste-companies-array";
import { WasteSectionTable } from "./sections/waste-section-table";

interface Props {
	catalogues: CataloguesDto;
}

export const NewTemplateForm = memo<Props>(({ catalogues }) => {
	const [user] = useAuth();
	const router = useRouter();

	const form = useForm<NewTemplateFormValues>({
		defaultValues: newTemplateFormDefaultValues,
		mode: "onChange",
	});

	const {
		control,
		formState: { isDirty, isSubmitting, isValid },
		handleSubmit,
		watch,
	} = form;

	const onSubmit = useCallback<SubmitHandler<NewTemplateFormValues>>(
		async values => {
			if (!user?.accessToken) {
				return;
			}

			const { error } = await fetcher<Template, TemplateDTO>({
				axiosInstance: apiClient,
				method: "post",
				url: "/templates/create",
				data: mapTemplateValues(values),
				accessToken: user.accessToken,
			});

			if (error) {
				if (error.statusCode === 400) {
					toast.error("??ablona s t??mto n??zvem ji?? existuje");
					return;
				}

				toast.error("Nepoda??ilo se vytvo??it ??ablonu");
				return;
			}

			await router.push("/templates");
			toast.success("??ablona ??sp????n?? vytvo??ena");
		},
		[router, user?.accessToken]
	);

	const [showModal, handleFormLeave] = useFormLeave((isDirty || isValid) && !isSubmitting);

	const onExit = useCallback(() => {
		router.back();
	}, [router]);

	const requireWasteCompany = watch("loadingCodes").some(code => code.requireWasteCompany);

	return (
		<>
			<FormProvider {...form}>
				<form noValidate onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-6">
						<NewTemplateFormSection description="Zadejte n??zev nov?? ??ablony" title="N??zev ??ablony">
							<Input
								className="w-full max-w-lg"
								control={control}
								label="N??zev ??ablony"
								name="title"
								required
								rules={{
									minLength: { value: 3, message: "N??zev ??ablony mus?? obsahovat alespo?? 3 znaky" },
									maxLength: { value: 60, message: "N??zev ??ablony nesm?? obsahovat v??ce ne?? 60 znak??" },
								}}
							/>
						</NewTemplateFormSection>
						<Divider />
						<NewTemplateFormSection
							description="Zadejte pros??m ??daje o&nbsp;provozovn??, za&nbsp;kterou bude vedena evidence v??etn?? kontaktn?? osoby"
							title="Provozovna"
							warning="* polo??ky jsou povinn??"
						>
							<div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
								<Input
									control={control}
									label="N??zev provozovny"
									name="medicalCompany.name"
									required
									rules={{
										minLength: { value: 3, message: "N??zev provozovny mus?? obsahovat alespo?? 3 znaky" },
										maxLength: { value: 60, message: "N??zev provozovny nesm?? obsahovat v??ce ne?? 60 znak??" },
									}}
								/>
								<Input
									control={control}
									inputMode="numeric"
									label="I??O"
									name="medicalCompany.uid"
									required
									rules={{
										pattern: { value: Validator.NUMBER_REGEXP, message: "Pouze ??islo" },
										validate: value => Validator.onlyPositiveNumber(value as string),
										minLength: { value: 2, message: "I??O mus?? obsahovat alespo?? 2 znaky" },
										maxLength: { value: 8, message: "I??O nesm?? obsahovat v??ce ne?? 8 znak??" },
									}}
								/>
								<Input
									control={control}
									label="I??Z/I??S/I??P"
									name="medicalCompany.companyId"
									required
									rules={{
										minLength: { value: 1, message: "I??Z/I??S/I??P mus?? obsahovat alespo?? 1 znak" },
										maxLength: { value: 12, message: "I??Z/I??S/I??P nesm?? obsahovat v??ce ne?? 12 znak??" },
									}}
								/>
								<Input
									control={control}
									label="M??sto"
									name="medicalCompany.address.city"
									required
									rules={{
										minLength: { value: 3, message: "M??sto mus?? obsahovat alespo?? 3 znaky" },
										maxLength: { value: 40, message: "M??sto nesm?? obsahovat v??ce ne?? 40 znak??" },
									}}
								/>
								<Input
									control={control}
									label="Ulice"
									name="medicalCompany.address.street"
									rules={{
										minLength: { value: 3, message: "Ulice mus?? obsahovat alespo?? 3 znaky" },
										maxLength: { value: 40, message: "Ulice nesm?? obsahovat v??ce ne?? 60 znak??" },
									}}
								/>
								<div className="flex space-x-6">
									<Input
										className="min-w-[5rem]"
										control={control}
										label="??.P."
										name="medicalCompany.address.registryNumber"
										rules={{
											maxLength: { value: 5, message: "??.P. nesm?? obsahovat v??ce ne?? 5 znak??" },
										}}
									/>
									<Input
										className="min-w-[5rem]"
										control={control}
										label="??.0."
										name="medicalCompany.address.buildingNumber"
										rules={{
											maxLength: { value: 5, message: "??.O. nesm?? obsahovat v??ce ne?? 5 znak??" },
										}}
									/>
								</div>
								<Autocomplete
									autocompleteProps={{
										getOptionLabel: (option: TerritorialUnit) => (option.uid === 0 ? "" : `${option.uid} \u2013 ${option.name}`),
										noOptionsText: "????dn?? Z??J nebyl nalezen",
									}}
									control={control}
									label="Z??J"
									name="medicalCompany.territorialUnit"
									options={catalogues.territorialUnits ?? []}
									required
								/>
								<Autocomplete
									autocompleteProps={{
										getOptionLabel: (option: Zipcode) => (option.uid === 0 ? "" : `${option.uid} \u2013 ${option.name}`),
										noOptionsText: "????dn?? PS?? nebyl nalezen",
									}}
									control={control}
									label="PS??"
									name="medicalCompany.address.zipcode"
									options={catalogues.zipcodes ?? []}
								/>
							</div>
							<div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
								<p className="col-span-2 mb-2 text-xl font-medium text-primary">Kontaktn?? osoba</p>
								<Input
									className="col-span-2 md:col-span-1 md:col-start-1"
									control={control}
									label="Jm??no"
									name="medicalCompany.contactFirstName"
									rules={{
										maxLength: { value: 40, message: "Jm??no nesm?? obsahovat v??ce ne?? 40 znak??" },
									}}
								/>
								<Input
									className="col-span-2 md:col-span-1 md:col-start-2"
									control={control}
									label="P????jmen??"
									name="medicalCompany.contactLastName"
									rules={{
										maxLength: { value: 40, message: "P????jmen?? nesm?? obsahovat v??ce ne?? 40 znak??" },
									}}
								/>
								<Input
									className="col-span-2 md:col-span-1 md:col-start-1"
									control={control}
									inputMode="numeric"
									label="Telefon"
									name="medicalCompany.contactPhone"
									type="tel"
								/>
								<Input
									className="col-span-2 md:col-span-1 md:col-start-2"
									control={control}
									label="E-mail"
									name="medicalCompany.contactEmail"
									type="email"
								/>
							</div>
						</NewTemplateFormSection>
						<Divider />
						<NewTemplateFormSection
							description="Vyberte, pros??m, odpady ze&nbsp;seznamu, kter??&nbsp;budou povolen?? p??i&nbsp;evidovan?? za&nbsp;tuto provozovnu"
							title="Povolen?? odpady"
						>
							<WasteSectionTable control={control} name="wastes" wastes={catalogues.wastes} />
						</NewTemplateFormSection>
						<Divider />
						<NewTemplateFormSection
							description="Vyberte, pros??m, k??dy naklad??n?? ze&nbsp;seznamu, kter??&nbsp;budou povolen?? p??i&nbsp;evidovan?? za&nbsp;tuto provozovnu"
							title="K??dy nakl??d??n??"
						>
							<LoadingCodesSectionTable control={control} name="loadingCodes" loadingCodes={catalogues.loadingCodes} />
						</NewTemplateFormSection>
						<Divider />
						<NewTemplateFormSection
							className={clsx(!requireWasteCompany && "hidden")}
							description="Zadejte, pros??m, v??echny opr??vn??n?? osoby, kter?? mohou z&nbsp;provozovny p??evz??t odpad, nebo partnery, kter?? odpad na&nbsp;provozovnu p??ed??vaj??"
							title="Opr??vn??n?? osoby (partner)"
						>
							<WasteCompaniesArray
								control={control}
								name="wasteCompanies"
								requireWasteCompany={requireWasteCompany}
								territorialUnits={catalogues.territorialUnits}
								wasteCompanyDefaultValue={wasteCompanyDefaultValue}
								wasteCompanyTypes={catalogues.wasteCompanyTypes}
								zipcodes={catalogues.zipcodes}
							/>
						</NewTemplateFormSection>
						<Divider className={clsx(!requireWasteCompany && "hidden")} />
					</div>
					<div className="py-8">
						<div className="flex flex-col-reverse justify-end gap-6 md:flex-row">
							<Button onClick={onExit} variant="white">
								Zp??t
							</Button>
							<Button type="submit" variant="secondary">
								Ulo??it ??ablonu
							</Button>
						</div>
					</div>
				</form>
				<LeaveEditorModal isOpen={showModal} onClose={handleFormLeave(false)} onLeave={handleFormLeave(true)} />
			</FormProvider>
		</>
	);
});

NewTemplateForm.displayName = "NewTemplateForm";
