import axios from 'axios'

const getUrl = (shop) => {
  return `https://${shop}/admin/api/2020-04`
}

export const getActiveTheme = async (shop, accessToken) => {
  const resultThemes = await axios.get(
    `${getUrl(shop)}/themes.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken
      }
    }
  )

  return resultThemes.data.themes.find(theme => theme.role === 'main')
}

//GET /admin/api/2020-04/themes/#{theme_id}/assets.json?asset[key]=assets/bg-body.gif
export const getAsset = async (shop, accessToken, path) => {
  const activeTheme = await getActiveTheme(shop, accessToken)

  let asset = null
  try {
    const result = await axios.get(
      `${getUrl(shop)}/themes/${activeTheme.id}/assets.json?asset[key]=${path}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken
        }
      }
    );
    if (result) {
      asset = result.data
    }
  } catch (e) {}

  return asset
}

export const setAsset = async (shop, accessToken, path, value) => {
  const activeTheme = await getActiveTheme(shop, accessToken)

  let success = true
  try {
    await axios.put(
      `${getUrl(shop)}/themes/${activeTheme.id}/assets.json`,
      {
        "asset": {
          "key": path,
          "value": value
        }
      },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken
        }
      }
    );
  } catch (e) {
    console.log('error', e);

    success = false
  }

  return success
}

export const deleteAsset = async (shop, accessToken, path) => {
  const activeTheme = await getActiveTheme(shop, accessToken)

  let success = true
  try {
    await axios.delete(
      `${getUrl(shop)}/themes/${activeTheme.id}/assets.json?asset[key]=${path}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken
        }
      }
    );
  } catch (e) {
    console.log('error', e);

    success = false
  }

  return success
}

/**
 * Modify an existing liquid file by appending content
 * @param {*} path
 */
export const appendToLiquid = async (shop, accessToken, path='layout/theme.liquid', str) => {
  const liquid = await getAsset(shop, accessToken, path)

  let liquidValue = liquid.asset.value
  liquidValue = `${liquidValue}\n${str}`

  //modify the layout
  await setAsset(shop, accessToken, path, liquidValue)

  return true
}

/**
 * Modify an existing liquid file by removing content
 * @param {*} path
 */
export const removeFromLiquid = async (shop, accessToken, path='layout/theme.liquid', str) => {
  // Get the liquid file
  const liquid = await getAsset(shop, accessToken, path)

  if (liquid) {
    let liquidValue = liquid.asset.value
    //const regex = /.*cp-newsletter-lc-24850.*\n/g;
    const regex = new RegExp(`.*${str}.*\n`, 'g')
    liquidValue = liquidValue.replace(regex, '')

    //modify the liquid file
    await setAsset(shop, accessToken, path, liquidValue)
  }

  return true
}

/**
 * Modify an existing liquid file by swapping 2 lines based on keywords
 * @param {*} path
 */
export const swapContentInLiquid = async (shop, accessToken, path, from, to) => {
  // Get the liquid file
  const liquid = await getAsset(shop, accessToken, path)

  if (liquid) {
    let liquidValue = liquid.asset.value
    //const regex = /.*cp-newsletter-lc-24850.*\n/g;
    const regexFrom = new RegExp('.*'+from+'.*', 'g')
    const regexTo = new RegExp('.*'+to+'.*', 'g')
    let m;
    let strToSwap = ''

    while ((m = regexFrom.exec(liquidValue)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regexFrom.lastIndex) {
            regexFrom.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if (groupIndex === 0) {
          strToSwap = match
        }
      });
    }

    console.log('BEFORE liquidValue', liquidValue, 'strToSwap', strToSwap);

    liquidValue = liquidValue.replace(regexFrom, '').replace(regexTo, function (x) {
      return `${strToSwap}\n${x}`
    })

    console.log('AFTER liquidValue', liquidValue, 'strToSwap', strToSwap);

    //modify the liquid file
    await setAsset(shop, accessToken, path, liquidValue)
  }

  return true
}

/**
 *
 * Duplicate an asset
 * @param {*} source
 */
export const duplicateAsset = async (shop, accessToken, source = 'layout/theme.liquid', destination) => {
  const activeTheme = await getActiveTheme(shop, accessToken)
  let liquid = null
  try {
    liquid = await getAsset(shop, accessToken, source)
    //console.log('liquid', liquid);
  } catch (e) {
    console.log('error', e);
  }
  if (liquid) {
    const regex = /({% schema %})([^]*.+[^]*)({% endschema %})/gmi
    let m;
    let schema = ''
    while ((m = regex.exec(liquid.asset.value)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if (groupIndex === 0) {
          return
        }
        if (groupIndex === 2) {
          let json = JSON.parse(match)
          delete json.presets
          match = JSON.stringify(json)
        }
        schema = `${schema}${match}`
      });
    }
    const liquidValue = liquid.asset.value.replace(regex, schema)
    console.log('liquidValue', liquidValue, 'destination', destination)
    await setAsset(shop, accessToken, destination, liquidValue)
  }

  return true
}

// /admin/api/2020-07/pages/{page_id}.json
export const getPage = async (shop, accessToken, pageId) => {

  const result = await axios.get(
    `${getUrl(shop)}/pages/${pageId}.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken
      }
    }
  )

  return result
}
