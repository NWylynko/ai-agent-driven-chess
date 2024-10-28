import weaviate from 'weaviate-client'

const client = await weaviate.connectToWeaviateCloud(
  'https://j9bgrypscuy6lu7prupea.c0.us-west3.gcp.weaviate.cloud', { 
    authCredentials: new weaviate.ApiKey('0eXR65atXJQi8aBQdb3m6HuCVtI8LmNIiv3C'),
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY!,
    }
  }
)

type PageProps = {
  searchParams: Promise<{
    query: string | undefined;
  }>
}

export default async function PastGames(props: PageProps) {

  const { query } = await props.searchParams

  if (!query) {
    return <div>No query provided</div>
  }

  const games = client.collections.get("Games")

  const data = await games.query.nearText(query, { limit: 10 })

  return (
    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}