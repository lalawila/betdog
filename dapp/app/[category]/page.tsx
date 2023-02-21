export default function Page({
    params,
}: {
    params: {
        category: string
    }
}) {
    return <h1>{params.category}</h1>
}
