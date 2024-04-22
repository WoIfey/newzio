'use client'
import Image from 'next/image'
import {
	ShareIcon,
	ClipboardDocumentCheckIcon,
	TrashIcon,
} from '@heroicons/react/24/outline'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { remove } from '@/app/actions'
import { useSession } from 'next-auth/react'
import { useAtom } from 'jotai'
import { deletedNews } from '@/utils/atoms'
import { useRouter } from 'next/navigation'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { formatDistanceToNowStrict } from 'date-fns'
import Loading from './Loading'
import { Copy } from 'lucide-react'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function News({ data, params }: { data: any; params: any }) {
	const [deletePost, setDeletePost] = useAtom(deletedNews)
	const router = useRouter()

	const confirm = async () => {
		try {
			await remove(data.id)
			setDeletePost(true)
			router.push('/')
			toast(
				<div className="flex gap-2">
					<TrashIcon className="h-5 w-5" />
					<span>News successfully deleted.</span>
				</div>
			)
		} catch (error) {
			console.error('Failed to delete post:', error)
		}
	}

	const share = async () => {
		try {
			await navigator.clipboard.writeText(
				`https://newzio.vercel.app/${params.title}/${params.id}`
			)
			toast(
				<div className="flex gap-2">
					<ClipboardDocumentCheckIcon className="h-5 w-5" />
					<span>News copied to clipboard.</span>
				</div>
			)
		} catch (error) {
			console.error('Failed to share post:', error)
		}
	}

	const { data: session } = useSession()
	if (!data) {
		return <Loading />
	}
	const currentUserId = session?.user?.id

	return (
		<div className="lg:max-w-2xl bg-[#e4ebec] dark:bg-[#2F3335] min-h-dvh">
			<div key={data.id}>
				<div className="m-6 sm:m-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
						<h1 className="text-3xl font-bold mb-4 break-all">{data.title}</h1>
					</div>
					<div className="flex gap-1 sm:flex-row flex-col">
						<div className="flex gap-3 items-center flex-row">
							<span className="bg-[#bfccdc] dark:bg-[#404B5E] px-1.5 py-1 dark:text-white text-sm rounded-lg">
								{data.tag}
							</span>
							<h1 className="text-sm">By {data.user_name}</h1>
						</div>
						<div className="flex items-center">
							<p className="text-sm">
								published{' '}
								<span className="dark:text-slate-300 text-slate-600">
									{formatDistanceToNowStrict(new Date(data.createdAt), {
										addSuffix: true,
									})}
								</span>
							</p>
						</div>
					</div>
					<div className="mt-4 flex gap-2">
						<Dialog>
							<TooltipProvider delayDuration={100}>
								<Tooltip>
									<TooltipTrigger
										asChild
										className="bg-[#bfccdc] dark:bg-[#404B5E] rounded-full p-1.5 hover:dark:bg-slate-600 hover:bg-[#9fb1c7] transition-all duration-100"
									>
										<DialogTrigger>
											<ShareIcon className="h-6 w-6" />
										</DialogTrigger>
									</TooltipTrigger>
									<TooltipContent>
										<p>Share News</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Share news</DialogTitle>
									<DialogDescription>
										Share this fascinating news with anyone you know!
									</DialogDescription>
								</DialogHeader>
								<div className="flex items-center space-x-2">
									<div className="grid flex-1 gap-2">
										<Label htmlFor="link" className="sr-only">
											Link
										</Label>
										<Input
											id="link"
											defaultValue={`https://newzio.vercel.app/${params.title}/${params.id}`}
											readOnly
										/>
									</div>
									<Button onClick={share} type="submit" size="sm" className="px-3">
										<span className="sr-only">Copy</span>
										<Copy className="h-4 w-4" />
									</Button>
								</div>
								<DialogFooter className="sm:justify-start">
									<DialogClose asChild>
										<Button type="button" variant="outline">
											Close
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						{currentUserId === data.user_id && (
							<AlertDialog>
								<TooltipProvider delayDuration={100}>
									<Tooltip>
										<TooltipTrigger
											className="bg-red-400 dark:bg-red-700 rounded-full p-1.5 hover:dark:bg-red-800 hover:bg-red-500 transition-all duration-100"
											asChild
										>
											<AlertDialogTrigger>
												<TrashIcon className="h-6 w-6" />
											</AlertDialogTrigger>
										</TooltipTrigger>

										<TooltipContent>
											<p>Delete News</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle className="text-red-600 flex gap-2 items-center sm:flex-row flex-col">
											<TrashIcon className="h-6 w-6" />
											Permanently delete this news post?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete this news
											post and will no longer be viewable.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<Button onClick={() => confirm()} asChild>
											<AlertDialogAction type="submit">Proceed</AlertDialogAction>
										</Button>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>
				</div>
				<div className="flex items-center justify-center">
					{data.url && data.url.endsWith('.mp4') ? (
						<video
							width="1080"
							height="720"
							className="max-h-[640px] w-[640px]"
							autoPlay
							loop
							muted
						>
							{data.url ? (
								<source src={data.url} type="video/mp4" />
							) : (
								<>
									<Image
										alt={data.name}
										width={1080}
										height={720}
										src="/file-x.svg"
										unoptimized
										className="max-h-[640px] w-[640px] object-fill bg-slate-900 p-52"
									/>
									<p className="text-white">File not found.</p>
								</>
							)}
							Your browser does not support the video tag.
						</video>
					) : data.url ? (
						<Image
							alt={data.name}
							width={1080}
							height={720}
							src={data.url}
							unoptimized
							className="max-h-[640px] w-[640px] object-fill"
						/>
					) : (
						<div className="flex flex-col">
							<Image
								alt={data.name}
								width={1080}
								height={720}
								src="/file-x.svg"
								unoptimized
								className="max-h-[640px] w-[640px] object-fill bg-slate-950 p-52"
							/>
							<p className="dark:text-white mx-8">Image does not exist.</p>
						</div>
					)}
				</div>
				<div className="m-6 sm:mx-8">
					<p className="leading-7 break-all">{data.description}</p>
				</div>
			</div>
		</div>
	)
}