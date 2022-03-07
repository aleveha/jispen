import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function main() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix("api");
	await app.listen(8000);
}

main();
