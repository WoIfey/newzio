'use client'
import {
	Check,
	CheckCircle2Icon,
	ChevronsUpDown,
	Pencil,
	Plus,
} from 'lucide-react'
import AddEditor from '@/components/AddEditor'
import { createArticle, fileRemove } from '@/server/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { useForm, SubmitHandler } from 'react-hook-form'
import { UploadDropzone } from '@/utils/uploadthing'
import {
	tagInput,
	bodyInput,
	leadInput,
	headlineInput,
	fileUrlInput,
	fileTypeValue,
	fileKeyValue,
} from '@/utils/atoms'
import { useAtom } from 'jotai'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { UploadDetails } from 'uploadDetails'
import { ArticleFields } from 'ArticleFields'
import MiniPreview from './MiniPreview'
import Preview from './Preview'
import { useRouter } from 'next/navigation'

interface Tag {
	id: string
	tag: string
}

export default function Add({ tags }: { tags: any }) {
	const [open, setOpen] = useState(false)
	const [body, setBody] = useAtom(bodyInput)
	const [tagValue, setTagValue] = useAtom(tagInput)
	const [headline, setHeadline] = useAtom(headlineInput)
	const [lead, setLead] = useAtom(leadInput)
	const [fileUrl, setFileUrl] = useAtom(fileUrlInput)
	const [fileType, setFileType] = useAtom(fileTypeValue)
	const [fileKey, setFileKey] = useAtom(fileKeyValue)
	const [loading, setLoading] = useState(false)
	const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ArticleFields>()

	const { data: session } = useSession()
	const currentUserId = session?.user?.id
	const router = useRouter()

	const handleRemove = async () => {
		await fileRemove(fileKey)
	}

	const onSubmit: SubmitHandler<ArticleFields> = async data => {
		try {
			data.body = body
			data.tag = tagValue
			if (uploadDetails) {
				data.uploadDetails = uploadDetails
			}
			const user_id = session?.user.id as unknown as number
			const user_name = session?.user.name ?? ''
			const user_image = session?.user.image ?? ''
			const result = await createArticle(
				data.headline,
				data.lead,
				data.body,
				data.tag,
				data.uploadDetails,
				user_id,
				user_name,
				user_image
			)
			if (result.success) {
				setTagValue('')
				setHeadline('')
				setLead('')
				setBody('')
				setFileUrl('')
				setFileType('')
				setFileKey('')
				setUploadDetails(null)
				toast(
					<div className="flex gap-2">
						<CheckCircle2Icon className="size-5" />
						<span>Article successfully published.</span>
					</div>,
					{
						position: 'bottom-center',
					}
				)
				router.push(
					`/${encodeURIComponent(
						data.tag
							? data.tag
									.toLowerCase()
									.replace(/ö/g, 'o')
									.replace(/ä/g, 'a')
									.replace(/å/g, 'a')
									.replace(/\s+/g, '-')
							: 'article'
					)}/${encodeURIComponent(
						data.headline
							? data.headline
									.toLowerCase()
									.replace(/ö/g, 'o')
									.replace(/ä/g, 'a')
									.replace(/å/g, 'a')
									.replace(/\s+/g, '-')
							: 'untitled'
					)}/${result.id}`
				)
			} else {
				toast(
					<div className="flex gap-2">
						<XCircleIcon className="size-5 text-red-500" />
						<span>{`${result.error}`}</span>
					</div>,
					{
						position: 'bottom-center',
					}
				)
			}
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<>
			<div className="w-full md:pt-16 md:flex md:justify-center">
				<Preview user={session} />
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="md:w-[500px] lg:w-[640px] bg-[#e4e4e4] dark:bg-[#0b0d18] text-black dark:text-white shadow-sm ring-1 ring-gray-900/5 md:col-span-2"
				>
					<div className="flex gap-2 items-center px-4 sm:px-8 pt-6 text-xl font-bold">
						<Plus className="size-6" />
						<p>Publish article</p>
					</div>
					<div className="px-4 py-6 sm:p-8">
						<div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-6">
							<div className="sm:col-span-4">
								<Label htmlFor="tag" className="block text-sm font-medium leading-6">
									Tag
								</Label>
								<div className="mt-2">
									<Popover open={open} onOpenChange={setOpen}>
										<PopoverTrigger id="tag" asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={open}
												className="justify-between"
											>
												{tagValue ? tagValue : 'Select tag...'}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Command>
												<CommandInput placeholder="Search tag..." />
												<CommandEmpty>No tags found.</CommandEmpty>
												<CommandGroup>
													<CommandList>
														{tags
															.filter(
																(tag: Tag) =>
																	tag.tag !== 'Newzio' || currentUserId === '87246869'
															)
															.sort((a: Tag, b: Tag) => {
																if (a.tag === 'Other' || a.tag === 'Newzio') return 1
																if (b.tag === 'Other' || b.tag === 'Newzio') return -1
																return a.tag.localeCompare(b.tag)
															})
															.map((tag: Tag) => (
																<CommandItem
																	key={tag.id}
																	value={tag.tag}
																	onSelect={currentTag => {
																		setTagValue(currentTag === tagValue ? '' : currentTag)
																		setOpen(false)
																	}}
																>
																	<Check
																		className={cn(
																			'mr-2 h-4 w-4',
																			tagValue === tag.tag ? 'opacity-100' : 'opacity-0'
																		)}
																	/>
																	{tag.tag}
																</CommandItem>
															))}
													</CommandList>
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
							</div>

							<div className="col-span-full">
								<Label
									htmlFor="headline"
									className="block text-sm font-medium leading-6"
								>
									Headline <span className="text-red-600">*</span>
								</Label>
								<div className="mt-2">
									<Input
										{...register('headline', {
											required: 'There is no headline!',
											minLength: {
												value: 4,
												message: 'The headline might be too short!',
											},
											maxLength: { value: 64, message: 'The headline is too long!' },
											validate: {
												checkStartSpace: value =>
													!value.startsWith(' ') ||
													'Headline cannot start or end with spaces!',
												checkEndSpace: value =>
													!value.endsWith(' ') ||
													'Headline cannot start or end with spaces!',
											},
										})}
										id="headline"
										name="headline"
										type="text"
										placeholder="Something..."
										minLength={4}
										maxLength={64}
										value={headline}
										onChange={e => setHeadline(e.target.value)}
										className={`${
											headline.length >= 64 ? 'border-red-500 focus:border-red-700' : ''
										}`}
									/>
									{errors.headline && (
										<div className="text-sm mt-2 text-red-500 bg-[#FFFFFF] dark:bg-[#020817] border-gray-200 dark:border-gray-800 border p-2 rounded-md">
											{errors.headline.message}
										</div>
									)}
									<span
										className={`text-xs ${headline.length >= 64 ? 'text-red-500' : ''}`}
									>
										{headline.length}/64
									</span>
								</div>
							</div>
							<div className="col-span-full">
								<Label htmlFor="lead" className="block text-sm font-medium leading-6">
									Lead
								</Label>
								<div className="mt-2">
									<Textarea
										{...register('lead', {
											minLength: { value: 8, message: 'The lead is too short!' },
											maxLength: { value: 256, message: 'The lead is too long!' },
											validate: {
												checkStartSpace: value =>
													!value.startsWith(' ') ||
													'The lead cannot start or end with spaces!',
												checkEndSpace: value =>
													!value.endsWith(' ') ||
													'The lead cannot start or end with spaces!',
											},
										})}
										name="lead"
										placeholder="This is such a crazy story..."
										id="lead"
										className={`min-h-24 max-h-40 ${
											lead.length >= 256 ? 'border-red-500 focus:border-red-700' : ''
										}`}
										value={lead}
										minLength={8}
										maxLength={256}
										onChange={e => setLead(e.target.value)}
									/>
									{errors.lead && (
										<div className="text-sm mt-2 text-red-500 bg-[#FFFFFF] dark:bg-[#020817] border-gray-200 dark:border-gray-800 border p-2 rounded-md">
											{errors.lead.message}
										</div>
									)}
									<span
										className={`text-xs ${lead.length >= 256 ? 'text-red-500' : ''}`}
									>
										{lead.length}/256
									</span>
								</div>
							</div>
							<div className="col-span-full">
								<Label htmlFor="body" className="block text-sm font-medium leading-6">
									Body
								</Label>
								<div className="mt-2">
									<AddEditor />
									<span
										className={`text-xs ${body.length >= 4096 ? 'text-red-500' : ''}`}
									>
										{body.length}/4096
									</span>
								</div>
							</div>

							<div className="col-span-full">
								<Label htmlFor="file" className="block text-sm font-medium leading-6">
									{'News cover'}
								</Label>
								{fileUrl && (
									<Button
										onClick={() => {
											setFileUrl('')
											setFileType('')
											setUploadDetails(null)
											handleRemove()
											setFileKey('')
										}}
										className="mt-2 w-full mb-4 flex gap-1 bg-slate-300 hover:bg-slate-200 text-black dark:bg-slate-700 dark:hover:bg-slate-800 dark:text-white"
									>
										<Pencil className="size-5 p-0.5" />
										Change File
									</Button>
								)}
								{fileType && fileUrl && fileType.startsWith('video') ? (
									<video
										width="1080"
										height="720"
										className="h-64 w-full rounded-md"
										autoPlay
										controls
									>
										<source src={fileUrl} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
								) : fileType && fileUrl ? (
									<Image
										src={fileUrl}
										alt={fileType}
										width={1280}
										height={720}
										className="h-64 w-full rounded-md"
									/>
								) : null}

								{!fileUrl ? (
									<UploadDropzone
										className="pt-2"
										endpoint="mediaPost"
										appearance={{
											uploadIcon: 'mt-6',
											label:
												'text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-600 ',
											button:
												'bg-blue-300 hover:bg-blue-200 text-black dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white transition-all duration-150',
											container:
												'flex-col rounded-md border-blue-400 dark:border-blue-900 bg-[#FFFFFF] dark:bg-[#020817]',
											allowedContent:
												'flex h-8 flex-col items-center justify-center px-2 text-slate-800 dark:text-slate-300',
										}}
										content={{
											label({ isUploading, isDragActive }) {
												if (isUploading) return ''
												if (isDragActive) return 'Drag and drop'
												return `Upload file or drag and drop`
											},
											allowedContent({ fileTypes, isUploading }) {
												if (isUploading) {
													setLoading(true)
													return 'Uploading file!'
												}
												return `${fileTypes.join(' or ')} up to 8MB`
											},
										}}
										onClientUploadComplete={res => {
											const uploadDetails = res[0]
											setFileUrl(res[0].url)
											setFileType(res[0].type)
											setFileKey(res[0].key)

											const convertedUploadDetails = {
												...uploadDetails,
												serverData: {
													...uploadDetails.serverData,
													id: Number(uploadDetails.serverData.id) || 0,
													user: uploadDetails.serverData.user || '',
												},
											}
											setUploadDetails(convertedUploadDetails)
											setLoading(false)
										}}
										onUploadError={error => {
											toast(
												<div className="flex gap-2">
													<XCircleIcon className="h-5 w-5 text-red-600" />
													<span>
														{`The file(s) you are trying to upload are either too many or too large`}
													</span>
												</div>,
												{
													position: 'bottom-center',
												}
											)
										}}
									/>
								) : null}
							</div>
						</div>
					</div>
					<div className="flex items-center justify-end gap-x-4 sm:gap-x-6 border-t border-gray-900/10 dark:border-gray-50/10 px-4 py-4 sm:px-8">
						<MiniPreview user={session} />
						<Button
							disabled={isSubmitting || loading}
							type="submit"
							className="w-full flex gap-1 bg-blue-300 hover:bg-blue-200 text-black dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
						>
							{loading ? (
								<div className="flex items-center gap-2 text-black dark:text-white mr-1">
									<div role="status">
										<svg
											aria-hidden="true"
											className="size-4 text-gray-400 animate-spin dark:text-gray-500 fill-blue-700 dark:fill-sky-500"
											viewBox="0 0 100 101"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
												fill="currentColor"
											/>
											<path
												d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
												fill="currentFill"
											/>
										</svg>
										<span className="sr-only text-2xl">Loading...</span>
									</div>
									<div className="text-black dark:text-white">
										Waiting for news cover to upload...
									</div>
								</div>
							) : (
								<>
									{!isSubmitting && <Plus className="size-5 p-0.5" />}
									{isSubmitting ? 'Publishing...' : `Publish as ${session?.user?.name}`}
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</>
	)
}
