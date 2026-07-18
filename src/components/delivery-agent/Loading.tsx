
const Loading = () => {
    return (
        <div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="flex items-center gap-4 rounded-lg border p-4 animate-pulse"
                    >
                        <div className="h-10 w-10 rounded-full bg-slate-200" />

                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 rounded bg-slate-200" />
                            <div className="h-3 w-1/2 rounded bg-slate-100" />
                        </div>

                        <div className="h-8 w-20 rounded bg-slate-200" />
                        <div className="h-8 w-16 rounded bg-slate-200" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Loading
