import { Address, LoadingCode, MedicalCompany, Waste, WasteCompany } from "@api/templates/types";

export type DefaultValues<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends string | number | null ? string : DefaultValues<T[K]> | null;
};

export interface NewTemplateFormValues {
	loadingCodes: LoadingCode[];
	medicalCompany: DefaultValues<Omit<MedicalCompany, "id" | "address" | "userId">> & {
		address: DefaultValues<Omit<Address, "id" | "zipcodeId">>;
	};
	title: string;
	wasteCompanies: (DefaultValues<
		Omit<WasteCompany, "id" | "address" | "territorialUnitId" | "addressId" | "templateId" | "expiredAt" | "typeId">
	> & {
		address: DefaultValues<Omit<Address, "id" | "zipcodeId">>;
		expiredAt?: string;
	})[];
	wastes: Waste[];
}

export const newTemplateFormDefaultValues: NewTemplateFormValues = {
	loadingCodes: [],
	medicalCompany: {
		uid: "",
		companyId: "",
		name: "",
		territorialUnitId: "",
		addressId: "",
		contactFirstName: "",
		contactLastName: "",
		contactPhone: "",
		contactEmail: "",
		address: {
			city: "",
			street: "",
			registryNumber: "",
			buildingNumber: "",
			zipcode: null,
		},
		territorialUnit: null,
	},
	title: "",
	wasteCompanies: [],
	wastes: [],
};

export const wasteCompanyDefaultValue: NewTemplateFormValues["wasteCompanies"][number] = {
	uid: "",
	companyId: "",
	name: "",
	address: {
		street: "",
		buildingNumber: "",
		registryNumber: "",
		city: "",
		zipcode: null,
	},
	territorialUnit: null,
	type: null,
};
