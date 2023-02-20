export default async function Page({
    params,
}: {
    params: {
        categories: string
    }
}) {
    return <h1>{params.categories}</h1>
}
