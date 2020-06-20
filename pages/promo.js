import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Page,
  Stack,
  TextField,
  DatePicker,
  Filters,
  EmptyState,
  ResourceList,
  ResourceItem,
  TextStyle,
  Thumbnail,
  TextContainer,
  Heading,
  Banner,
} from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";

const Promo = ({ data }) => {
  const appliedFilters = [];
  const filters = [];
  const [collections, setCollections] = useState([]);
  const [percentage, setPercentage] = useState("");
  const [references, setReferences] = useState("");
  const [previousTag, setPreviousTag] = useState("");

  const [{ month, year }, setDate] = useState({
    month: 6,
    year: 2020,
  });
  const [operationDates, setOperationsDate] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [active, setActive] = useState(false);
  const handleResourcePickerOpen = useCallback(() => setActive(true), []);
  const handleResourcePickerClose = useCallback(() => setActive(false), []);

  const handleSelection = useCallback(
    ({ selection }) => {
      console.log("Selected products: ", selection);
      handleResourcePickerClose();
      setCollections(selection);
    },
    [handleResourcePickerClose]
  );

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const handleSubmit = async () => {
    const form = {
      previousTag: previousTag,
      percentage: percentage,
      operationDates: operationDates,
      references: references,
      collections: collections,
    };
    console.log("operationDates", operationDates);

    const result = await fetch(`/app/fastmag/promo`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await result.json();
    console.log("result call", data);
  };

  const emptyStateMarkup =
    !appliedFilters.length && !collections.length ? (
      <EmptyState
        heading="Ajoutez les produits d'une collection à votre promo"
        image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
      >
        <p>
          Vous pouvez accéder au choix des collections en cliquant sur "ajouter"
        </p>
      </EmptyState>
    ) : undefined;

  return (
    <Page breadcrumbs={[{ content: "Dashboard", url: "/" }]} title="Pré-soldes">
      <Layout>
        <Layout.Section>
          <TextContainer spacing="loose">
            <Heading>Organisez votre campagne de pré-soldes</Heading>
            <p>
              Vous pouvez copier/coller une liste de produits depuis votre
              fichier Excel ou sélectionner des familles de produits.
            </p>
          </TextContainer>
        </Layout.Section>
        <Layout.Section>
          <Card sectioned>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <TextField
                  value={percentage}
                  onChange={(val) => setPercentage(val)}
                  label="Percentage"
                  type="number"
                />
                <DatePicker
                  month={month}
                  year={year}
                  onChange={setOperationsDate}
                  onMonthChange={handleMonthChange}
                  selected={operationDates}
                  allowRange={true}
                  locale={"fr"}
                />
                <TextField
                  value={references}
                  onChange={(val) => setReferences(val)}
                  label="references"
                  multiline={12}
                  helpText="Veuillez copier coller les références à inclure dans cette opération"
                />
                <Stack distribution="trailing">
                  <Button primary submit>
                    Generate
                  </Button>
                </Stack>
              </FormLayout>
            </Form>
            <ResourcePicker
              resourceType="Collection"
              open={active}
              onSelection={handleSelection}
              onCancel={handleResourcePickerClose}
            />
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card
            title="Collections"
            primaryFooterAction={{
              content: "Ajouter",
              onAction: handleResourcePickerOpen,
            }}
          >
            <ResourceList
              emptyState={emptyStateMarkup}
              items={collections}
              renderItem={(item) => {
                const { id, title, image, productsCount } = item;
                const media = (
                  <Thumbnail
                    source={
                      image != null
                        ? image.originalSrc
                        : "https://www.bible-marques.fr/assets/marques/images/logo/5c1356113f008e7c678b4567.png"
                    }
                    alt={title}
                  />
                );

                return (
                  <ResourceItem
                    id={id}
                    media={media}
                    accessibilityLabel={`View details for ${title}`}
                  >
                    <h3>
                      <TextStyle variation="strong">{title}</TextStyle>
                    </h3>
                    <div>nombre de produits : {productsCount}</div>
                  </ResourceItem>
                );
              }}
              resourceName={{ singular: "collection", plural: "collections" }}
            />
          </Card>
        </Layout.Section>
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

export default Promo;
