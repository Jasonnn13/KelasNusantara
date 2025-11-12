"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

type Role = "student" | "maestro" | "admin"

type ViewState =
	| { status: "loading" }
	| { status: "unauthenticated" }
	| { status: "error"; message: string }
	| { status: "ready" }

type FormValues = {
	email: string
	fullName: string
	avatarUrl: string
	displayName: string
	region: string
	discipline: string
	bio: string
}

const emptyForm: FormValues = {
	email: "",
	fullName: "",
	avatarUrl: "",
	displayName: "",
	region: "",
	discipline: "",
	bio: "",
}

export default function EditProfilePage() {
	const router = useRouter()
	const [viewState, setViewState] = useState<ViewState>({ status: "loading" })
	const [formValues, setFormValues] = useState<FormValues>(emptyForm)
	const [role, setRole] = useState<Role>("student")
		const [isSaving, setIsSaving] = useState(false)
		const [isUploading, setIsUploading] = useState(false)
	const userIdRef = useRef<string | null>(null)
	const mountedRef = useRef(true)
		const fileInputRef = useRef<HTMLInputElement | null>(null)

		const hydrateForm = useCallback((payload: Partial<FormValues>) => {
			setFormValues((prev) => {
				const next = { ...prev }
				for (const [key, value] of Object.entries(payload)) {
					if (value === undefined) continue
					next[key as keyof FormValues] = value as FormValues[keyof FormValues]
				}
				return next
			})
	}, [])

	const loadProfile = useCallback(async () => {
		const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
		if (!mountedRef.current) return

		if (sessionError) {
			setViewState({ status: "error", message: sessionError.message })
			return
		}

		const session = sessionData.session
		const user = session?.user
		if (!user) {
			setViewState({ status: "unauthenticated" })
			return
		}

		userIdRef.current = user.id

		const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
		const initialRole = (typeof metadata.role === "string" ? metadata.role : "student") as Role
		setRole(initialRole)

			hydrateForm({
				email: user.email ?? "",
				fullName: typeof metadata.full_name === "string" ? metadata.full_name : "",
				avatarUrl: typeof metadata.avatar_url === "string" ? metadata.avatar_url : "",
				displayName: typeof metadata.display_name === "string" ? metadata.display_name : "",
				region: typeof metadata.region === "string" ? metadata.region : "",
				discipline: typeof metadata.discipline === "string" ? metadata.discipline : "",
				bio: typeof metadata.bio === "string" ? metadata.bio : "",
			})

		setViewState({ status: "ready" })

		const { data, error } = await supabase
			.from("v_profile_overview")
			.select(
				"full_name, avatar_url, role, display_name, region, discipline, bio"
			)
			.eq("id", user.id)
			.maybeSingle()

		if (!mountedRef.current) return

		if (error) {
			console.warn("Gagal memuat detail profil", error.message)
			return
		}

		if (!data) return

		const overview = data as {
			full_name: string | null
			avatar_url: string | null
			role: Role
			display_name: string | null
			region: string | null
			discipline: string | null
			bio: string | null
		}

		setRole(overview.role ?? initialRole)
			hydrateForm({
				fullName: overview.full_name ?? undefined,
				avatarUrl: overview.avatar_url ?? undefined,
				displayName: overview.display_name ?? undefined,
				region: overview.region ?? undefined,
				discipline: overview.discipline ?? undefined,
				bio: overview.bio ?? undefined,
			})
		}, [hydrateForm])

	useEffect(() => {
		loadProfile()
		return () => {
			mountedRef.current = false
		}
	}, [loadProfile])

		const handleChange = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const value = event.target.value
		setFormValues((prev) => ({ ...prev, [field]: value }))
	}

			const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
				event.preventDefault()
				if (!userIdRef.current) return

				setIsSaving(true)
				const userId = userIdRef.current
				const isMaestro = role === "maestro"

				const normalizedFullName = formValues.fullName.trim() || null
				const normalizedAvatar = formValues.avatarUrl.trim() || null
				const normalizedBio = formValues.bio.trim() || null
				const normalizedRegion = formValues.region.trim() || null
				const normalizedDiscipline = formValues.discipline.trim() || null
				const normalizedDisplayName = formValues.displayName.trim() || null

				const profilePayload = {
					full_name: normalizedFullName,
					avatar_url: normalizedAvatar,
				}

				const maestroPayload = {
					id: userId,
					display_name: normalizedDisplayName,
					region: normalizedRegion,
					discipline: normalizedDiscipline,
					bio: normalizedBio,
					photo_url: normalizedAvatar,
				}

		try {
			const { error: profileError } = await supabase.from("profiles").update(profilePayload).eq("id", userId)
			if (profileError) throw profileError

			if (isMaestro) {
				const { error: maestroError } = await supabase
					.from("maestros")
					.upsert(maestroPayload, { onConflict: "id" })
				if (maestroError) throw maestroError
			}

			const { error: userUpdateError } = await supabase.auth.updateUser({
				data: {
					full_name: profilePayload.full_name,
					avatar_url: profilePayload.avatar_url,
					display_name: isMaestro ? normalizedDisplayName : null,
					region: isMaestro ? normalizedRegion : null,
					discipline: isMaestro ? normalizedDiscipline : null,
					bio: isMaestro ? normalizedBio : null,
					role,
				},
			})
			if (userUpdateError) throw userUpdateError

			toast.success("Profil berhasil diperbarui")
			router.push("/profile")
		} catch (error) {
			console.error(error)
			toast.error("Tidak dapat menyimpan perubahan. Coba lagi.")
		} finally {
			setIsSaving(false)
		}
	}

		const handleAvatarButton = () => {
			fileInputRef.current?.click()
		}

		const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			if (!file || !userIdRef.current) {
				event.target.value = ""
				return
			}

				if (file.size > 5 * 1024 * 1024) {
					toast.error("Ukuran file maksimal 5MB.")
					event.target.value = ""
					return
				}

			setIsUploading(true)
			const userId = userIdRef.current
			const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
			const uniqueId = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString()
			const storagePath = `avatars/${userId}-${uniqueId}.${extension}`

			try {
				const { error: uploadError } = await supabase.storage
					.from("media")
					.upload(storagePath, file, {
						cacheControl: "3600",
						upsert: true,
						contentType: file.type,
					})

				if (uploadError) throw uploadError

				const { data } = supabase.storage.from("media").getPublicUrl(storagePath)
				hydrateForm({ avatarUrl: data.publicUrl })
				toast.success("Foto profil berhasil diunggah")
			} catch (error) {
				console.error(error)
				toast.error("Tidak dapat mengunggah foto. Coba file lain.")
			} finally {
				setIsUploading(false)
				event.target.value = ""
			}
		}

	return (
		<main>
			<SiteNavbar />
			<section className="mx-auto max-w-3xl px-4 py-12">
				{viewState.status === "loading" && (
					<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center text-muted-foreground">
						<span className="h-12 w-12 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
						<p>Memuat pengaturan profil…</p>
					</div>
				)}

				{viewState.status === "unauthenticated" && (
					<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
						<p className="text-muted-foreground">Masuk untuk mengubah profilmu.</p>
						<div className="flex gap-2">
							<Button asChild>
								<Link href="/auth/sign-in">Masuk</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/auth/register">Daftar</Link>
							</Button>
						</div>
					</div>
				)}

				{viewState.status === "error" && (
					<div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
						<p className="text-destructive">Terjadi kesalahan saat memuat profil.</p>
						<p className="text-sm text-muted-foreground">{viewState.message}</p>
						<Button onClick={loadProfile}>Coba lagi</Button>
					</div>
				)}

				{viewState.status === "ready" && (
					<Card>
						<CardHeader>
							<CardTitle>Edit Profil</CardTitle>
							<CardDescription>Perbarui informasi pribadi dan tampilkan diri Anda kepada komunitas.</CardDescription>
						</CardHeader>
						<CardContent>
							<form className="grid gap-6" onSubmit={handleSubmit}>
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input id="email" value={formValues.email} disabled />
								</div>
								<div className="grid gap-2">
									<Label htmlFor="fullName">Nama lengkap</Label>
									<Input
										id="fullName"
										placeholder="Nama lengkap"
										value={formValues.fullName}
										onChange={handleChange("fullName")}
									/>
								</div>
												<div className="grid gap-2">
													<Label htmlFor="avatarUrl">Foto profil</Label>
													<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
														<div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted/40">
															{formValues.avatarUrl ? (
																<Image
																	src={formValues.avatarUrl}
																	alt="Preview foto profil"
																	fill
																	sizes="64px"
																	className="object-cover"
																/>
															) : (
																<span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
																	Tidak ada foto
																</span>
															)}
														</div>
														<div className="flex w-full flex-1 flex-col gap-2 sm:flex-row">
															<Input
																id="avatarUrl"
																placeholder="https://"
																value={formValues.avatarUrl}
																onChange={handleChange("avatarUrl")}
															/>
															<Button
																type="button"
																variant="outline"
																onClick={handleAvatarButton}
																disabled={isUploading}
																className="sm:w-40"
															>
																{isUploading ? "Mengunggah…" : "Unggah foto"}
															</Button>
														</div>
														<input
															ref={fileInputRef}
															type="file"
															accept="image/*"
															className="hidden"
															onChange={handleAvatarChange}
														/>
													</div>
													<p className="text-xs text-muted-foreground">Unggah gambar JPG, PNG, atau WebP hingga 5MB.</p>
												</div>

								{role === "maestro" && (
									<div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
										<p className="text-sm font-medium text-foreground">Detail Maestro</p>
										<div className="grid gap-2">
											<Label htmlFor="bio">Biografi</Label>
											<Textarea
												id="bio"
												placeholder="Ceritakan tentang dirimu atau disiplin yang kamu tekuni."
												rows={5}
												value={formValues.bio}
												onChange={handleChange("bio")}
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="displayName">Nama panggung</Label>
											<Input
												id="displayName"
												placeholder="Nama panggung atau brand"
												value={formValues.displayName}
												onChange={handleChange("displayName")}
											/>
										</div>
										<div className="grid gap-2 md:grid-cols-2">
											<div className="grid gap-2">
												<Label htmlFor="region">Wilayah</Label>
												<Input
													id="region"
													placeholder="Contoh: Gianyar, Bali"
													value={formValues.region}
													onChange={handleChange("region")}
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="discipline">Disiplin</Label>
												<Input
													id="discipline"
													placeholder="Contoh: Tari Legong"
													value={formValues.discipline}
													onChange={handleChange("discipline")}
												/>
											</div>
										</div>
									</div>
								)}

								<div className="flex flex-col items-stretch gap-3 md:flex-row md:justify-end">
									<Button asChild variant="outline" className="md:w-auto">
										<Link href="/profile">Batalkan</Link>
									</Button>
									<Button type="submit" disabled={isSaving} className="md:w-auto">
										{isSaving ? "Menyimpan…" : "Simpan perubahan"}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				)}
			</section>
			<SiteFooter />
		</main>
	)
}
