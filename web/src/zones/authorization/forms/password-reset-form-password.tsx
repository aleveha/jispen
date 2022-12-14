import { CaptchaDto } from "@api/auth/dto";
import { apiClient } from "@api/config";
import { fetcher } from "@api/index";
import { AccessTokenResponse } from "@api/types";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/inputs/text-input";
import { useRouter } from "next/router";
import React, { memo, useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useSWR, { Fetcher, mutate } from "swr";

interface RegistrationFormProps {
	accessToken: string;
}

interface RegistrationFormValues {
	captcha: string;
	password: string;
	repeatedPassword: string;
}

export const PasswordResetFormPassword = memo<RegistrationFormProps>(({ accessToken }) => {
	const { control, handleSubmit, reset, watch } = useForm<RegistrationFormValues>({
		defaultValues: {
			captcha: "",
			password: "",
			repeatedPassword: "",
		},
		mode: "onChange",
	});

	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const captchaFetcher = useCallback<Fetcher<CaptchaDto, string>>((url: string) => apiClient.get<CaptchaDto>(url).then(res => res.data), []);

	const { data: captchaResponse } = useSWR<CaptchaDto>("/captcha/generate", captchaFetcher);

	const passwordValue = watch("password");

	const onSubmit = useCallback<SubmitHandler<RegistrationFormValues>>(
		async values => {
			const loadingToastId = toast.loading("Probíhá nastavení nového hesla...");
			setIsLoading(true);
			const { error } = await fetcher<AccessTokenResponse, RegistrationFormValues>({
				axiosInstance: apiClient,
				method: "post",
				url: "/auth/register",
				data: values,
				accessToken,
			});
			setIsLoading(false);

			if (error) {
				if (error.statusCode === 422) {
					await mutate("/captcha/generate");
					toast.error("Neplatná capcha, zkuste prosím znovu", { id: loadingToastId });
					return;
				}

				toast.error("Během nastavení nového hesla se něco nepovedlo", { id: loadingToastId });
				return;
			}

			router.push("/login").then(() => toast.success("Nastavení nového hesla proběhla uspěšně", { id: loadingToastId }));
			reset();
		},
		[accessToken, reset, router]
	);

	if (!captchaResponse) {
		router.push("/").then(() => toast.error("Během načítání stránky se něco nepovedlo"));
		return null;
	}

	return (
		<form
			className="mt-8 flex w-full flex-col items-start justify-center space-y-3 text-xl sm:w-96 md:space-y-6"
			noValidate
			onSubmit={handleSubmit(onSubmit)}
		>
			<Input
				control={control}
				fullWidth
				label="Heslo"
				name="password"
				required
				rules={{ minLength: { value: 8, message: "Heslo musí obsahovat minimalně 8 znaků" } }}
				type="password"
			/>
			<Input
				control={control}
				fullWidth
				label="Zopakujte heslo"
				name="repeatedPassword"
				required
				rules={{
					validate: value => {
						if (value !== passwordValue) {
							return "Hesla se musí shodovat";
						}
						return undefined;
					},
				}}
				type="password"
			/>
			<span className="w-full select-none rounded-xl bg-gray-400 py-2 px-4 text-center text-2xl text-white">{captchaResponse.captcha}</span>
			<Input
				control={control}
				fullWidth
				label="Zadejte kód z obrázku"
				name="captcha"
				required
				rules={{ required: "Nejprve musíte potvrdit, že nejste robot" }}
			/>
			<Button className="w-full" loading={isLoading} type="submit">
				Odeslat
			</Button>
		</form>
	);
});

PasswordResetFormPassword.displayName = "PasswordResetFormPassword";
