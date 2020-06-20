import { EmptyState, Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import fetch from "node-fetch";
import joinCookies from "../utils/joinCookies";

const img = "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

const Index = ({ data }) => (
  <Page>
    <Layout>
      <EmptyState
        heading="Connect your Fastmag ERP with Shopify"
        action={{
          content: "Go to the Dashboard",
          onAction: () => console.log("clicked"),
        }}
        image={img}
      >
        <p>
          Access the dashboard to monitor the connection on {data.Item.store}
        </p>
      </EmptyState>
    </Layout>
  </Page>
);

// This function gets called for each request
// You need an absolute URL + to pass the cookies in the request
// to avoid an error produced by shopify trying to auth the server routes...
// https://github.com/Shopify/shopify-app-node/issues/96
export async function getServerSideProps(ctx) {
  const baseUrl = ctx.req ? `https://${ctx.req.headers.host}` : "";
  const result = await fetch(`${baseUrl}/api/installjs`, {
    headers: {
      Cookie: ctx.req.headers.cookie,
    },
  });
  const data = await result.json();
  //console.log("data", data);

  return {
    props: {
      data,
    },
  };
}

export default Index;
