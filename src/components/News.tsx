'use client'
import Image from 'next/image'
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
const confirm = () => {
	window.location.href = '/'
}
export default function News({ data }: { data: any }) {
	const { data: session } = useSession()
	const currentUserId = session?.user?.id

	return (
		<div className="w-full">
			<div key={data.id}>
				<div>
					{data.url.endsWith('.mp4') ? (
						<video
							controls
							width="1080"
							height="720"
							className="max-h-[30rem] w-full object-cover"
							autoPlay
							muted
						>
							<source src={data.url} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					) : (
						<Image
							alt={data.name}
							width={1080}
							height={720}
							src={data.url}
							unoptimized
							className="max-h-[30rem] w-full object-cover"
						/>
					)}
				</div>
				<div className="m-6 sm:m-12">
					{currentUserId === data.user_id && (
						<div className="pb-4">
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button>Delete</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Are you sure?</AlertDialogTitle>
										<AlertDialogDescription>
											This action cannot be undone. This will permanently delete this post
											and remove it from our servers.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<form onSubmit={() => confirm()} action={remove}>
											<input name="id" type="hidden" value={data.id} />
											<AlertDialogAction type="submit">Proceed</AlertDialogAction>
										</form>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					)}
					<h1 className="text-slate-600 text-sm pb-3">{data.tag}</h1>
					<div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 pb-3 sm:pb-0">
						<h1 className="text-xl">{data.title}</h1>
						<p className="text-xs text-slate-600">
							{new Date(data.createdAt).toLocaleString('en-GB')}
						</p>
					</div>
					<h1 className="text-sm italic border-b-2 border-slate-400 pb-6">
						Written by {data.user_name}
					</h1>
					<p className="pt-6 leading-7">{data.description}</p>
				</div>
			</div>
		</div>
	)
}
