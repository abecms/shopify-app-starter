import { useState } from "react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Stack,
  TextField,
  ResourceList,
  TextStyle,
  Pagination,
  Spinner,
} from "@shopify/polaris";

const Settings = ({ data }) => {
  const [season, setSeason] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(false);

  const gotoNextPage = async () => {
    setLoading(true);
    const result = await fetch(
      `/app/fastmag/products-by-season?season=${season}&page=${page}`
    );
    const json = await result.json();
    setHasNext(true);
    if (page > 0) {
      setHasPrevious(true);
    }
    setPage(page + 1);
    //console.log("rows", json.result.rows);
    setTotal(json.result.total);
    setRows(json.result.rows);
    setLoading(false);
  };

  const gotoPreviousPage = async () => {
    setPage(page - 1);
    setLoading(true);
    const result = await fetch(
      `/app/fastmag/products-by-season?season=${season}&page=${page}`
    );
    const json = await result.json();
    setHasNext(true);
    setHasPrevious(false);
    if (page > 0) {
      setHasPrevious(true);
    }
    setPage(page + 1);
    //console.log("rows", json.result.rows);
    setTotal(json.result.total);
    setRows(json.result.rows);
    setLoading(false);
  };

  const syncSeason = async () => {
    console.log("getAllProductsFromSeason");
    const result = await fetch(
      `/app/fastmag/sync-products-by-season?season=${season}`
    );
    const json = await result.json();
    console.log("syncSeason", json);
  };

  const resourceName = {
    singular: "Produit",
    plural: "Produits",
  };

  const renderItem = (item) => {
    const { sku, prixvente, stock } = item;

    return (
      <div>
        <h3>
          <TextStyle variation="strong">{sku}</TextStyle>
        </h3>
        <div>
          prix : {prixvente}
          <br />
          stock : {stock}
        </div>
      </div>
    );
  };

  return (
    <Page>
      <Layout>
        <Layout.AnnotatedSection
          title={`Fastmag season ${season}`}
          description="Please select a Fastmag season to grab the products from fastmag."
        >
          <Card sectioned>
            {rows.length > 0 ? (
              <>
                <Pagination
                  label="Products"
                  hasPrevious={hasPrevious}
                  onPrevious={() => {
                    gotoPreviousPage();
                  }}
                  hasNext={hasNext}
                  onNext={() => {
                    gotoNextPage();
                  }}
                />
                <ResourceList
                  items={rows}
                  renderItem={renderItem}
                  resourceName={resourceName}
                  alternateTool={
                    <Button primary onClick={() => syncSeason()}>
                      Synchroniser avec Shopify
                    </Button>
                  }
                  showHeader
                  totalItemsCount={total}
                  loading={loading}
                />
              </>
            ) : (
              <Form onSubmit={gotoNextPage}>
                <FormLayout>
                  <TextField
                    value={season}
                    onChange={(val) => setSeason(val)}
                    label="Collection (ie. H20)"
                    type="season"
                  />
                  <Stack distribution="trailing">
                    <Button primary submit>
                      Search
                    </Button>
                  </Stack>
                </FormLayout>
              </Form>
            )}
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
};

export default Settings;
