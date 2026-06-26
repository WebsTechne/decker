type MetadataOptions = {
  title: string
  description: string
  image?: string
  type?: "website" | "article"
}

const APP_URL = process.env.BETTER_AUTH_URL!

const createMetadata = ({
  title,
  description,
  image,
  type = "website",
}: MetadataOptions) => {
  const meta = [
    {
      title,
    },
    {
      name: "description",
      content: description,
    },

    // Open Graph
    {
      property: "og:site_name",
      content: "Decker",
    },
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:type",
      content: type,
    },

    // Twitter
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: title,
    },
    {
      name: "twitter:description",
      content: description,
    },
  ]

  if (image) {
    const imageUrl = new URL(image, APP_URL).toString()

    meta.push(
      {
        property: "og:image",
        content: imageUrl,
      },
      {
        name: "twitter:image",
        content: imageUrl,
      },
    )
  }

  return { meta }
}

export { createMetadata }
