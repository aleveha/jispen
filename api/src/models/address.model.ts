import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ZipcodeModel } from "./zipcode.model";

@Entity("address")
export class AddressModel extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	city: string;

	@Column({ nullable: true })
	street?: string;

	@Column({ name: "registry_number", nullable: true })
	registryNumber?: string;

	@Column({ name: "building_number", nullable: true })
	buildingNumber?: string;

	@Column({ name: "zip_code_id", nullable: true })
	zipcodeId?: number;

	@JoinColumn({ name: "zip_code_id" })
	@ManyToOne(() => ZipcodeModel, zipCode => zipCode.addresses)
	zipcode?: ZipcodeModel;
}
