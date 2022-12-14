import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { AddressModel } from "./address.model";
import { RecordModel } from "./record.model";
import { TemplateModel } from "./template.model";
import { TerritorialUnitModel } from "./territorialUnit.model";
import { WasteCompanyTypeModel } from "./wasteCompanyType.model";

@Entity("waste_company")
export class WasteCompanyModel extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	uid: number;

	@Column({ name: "company_id", nullable: true })
	companyId: string;

	@Column({ nullable: true })
	name: string;

	@Column({ name: "type_id" })
	typeId: number;

	@JoinColumn({ name: "type_id" })
	@ManyToOne(() => WasteCompanyTypeModel, wasteCompanyType => wasteCompanyType.wasteCompanies)
	type: WasteCompanyTypeModel;

	@Column({ name: "territorial_unit_id" })
	territorialUnitId: number;

	@JoinColumn({ name: "territorial_unit_id" })
	@ManyToOne(() => TerritorialUnitModel, territorialUnit => territorialUnit.medicalCompanies)
	territorialUnit: TerritorialUnitModel;

	@Column({ name: "address_id", nullable: true })
	addressId: number;

	@JoinColumn({ name: "address_id" })
	@OneToOne(() => AddressModel, { cascade: ["insert", "update", "remove"] })
	address: AddressModel;

	@Column({ name: "template_id" })
	templateId: number;

	@JoinColumn({ name: "template_id" })
	@ManyToOne(() => TemplateModel, template => template.wasteCompanies, { onDelete: "CASCADE" })
	template: TemplateModel;

	@OneToMany(() => RecordModel, record => record.wasteCompany)
	records: RecordModel[];
}
