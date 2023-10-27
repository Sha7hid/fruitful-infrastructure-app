import { ActionFunctionArgs, json } from "@remix-run/node"; // or cloudflare/deno

export async function action({ request }: ActionFunctionArgs){
  try {
    // Extract the request body as JSON
    const body = await request.json();

    // Define the GraphQL query
    const graphqlQuery = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input)  {
          product {
            id
            title
            descriptionHtml
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  createdAt
                  inventoryItem{
                    tracked
                  }
                }
              }
            }
          }
        }
      }
    `;

    // Define the variables for the mutation
    const variables = {
      input: {
        title: body.title,
        descriptionHtml: body.descriptionHtml,
        variants: [{ price:body.variants.price, inventoryItem: { tracked: body.variants.inventoryItem.tracked },
          }],
      },
      // media:{
      //   mediaContentType:body.media.mediaContentType,
      //   originalSource:body.media.originalSource
      // }
    };

    // Send a POST request to the Shopify GraphQL API
    const response = await fetch("https://sha7hid.myshopify.com/admin/api/2021-07/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "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",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables,
      }),
    });

    // Check if the request was successful
    if (response.ok) {
      const responseData = await response.json();

      return json({ message: "GraphQL mutation executed successfully", response: responseData });
    } else {
      throw new Error(`Failed to execute GraphQL mutation: ${response.statusText}`);
    }
  } catch (error:any) {
    return json({ error: error.message });
  }
}
