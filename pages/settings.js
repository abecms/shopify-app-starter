import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Stack,
  TextField,
} from "@shopify/polaris";

const Settings = ({ data }) => {
  const [account, setAccount] = useState(data.account ? data.account : "");
  const [brand, setBrand] = useState(data.brand ? data.brand : "");
  const [store, setStore] = useState(data.store ? data.store : "");
  const [url, setUrl] = useState(data.url ? data.url : "");
  const [password, setPassword] = useState(data.password ? data.password : "");

  const handleSubmit = async () => {
    const form = {
      account: account,
      brand: brand,
      store: store,
      password: password,
      url: url,
    };
    const result = await fetch(`/app/fastmag/settings`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await result.json();
    console.log("result call", data);
  };

  return (
    <Page>
      <Layout>
        <Layout.AnnotatedSection
          title="Fastmag settings"
          description="Configure your Fastmag account to connect your Shopify store."
        >
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={account}
                  onChange={(val) => setAccount(val)}
                  label="Account"
                  type="account"
                />
                <TextField
                  value={brand}
                  onChange={(val) => setBrand(val)}
                  label="Brand"
                  type="brand"
                />
                <TextField
                  value={store}
                  onChange={(val) => setStore(val)}
                  label="Store"
                  type="store"
                />
                <TextField
                  value={url}
                  onChange={(val) => setUrl(val)}
                  label="Fastmag URL"
                  type="url"
                />
                <TextField
                  value={password}
                  onChange={(val) => setPassword(val)}
                  label="Password"
                  type="password"
                />
                <Stack distribution="trailing">
                  <Button primary submit>
                    Save
                  </Button>
                </Stack>
              </FormLayout>
            </Form>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
};

// This function gets called for each request
// You need an absolute URL + to pass the cookies in the request
// to avoid an error produced by shopify trying to auth the server routes...
// https://github.com/Shopify/shopify-app-node/issues/96
export async function getServerSideProps(ctx) {
  const baseUrl = ctx.req ? `https://${ctx.req.headers.host}` : "";
  const result = await fetch(`${baseUrl}/api/settings`, {
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

export default Settings;
