"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    // Browser
    const browser = await puppeteer.launch({ headless:false }) 
    console.log('OK---------------------------------')
    const page = await browser.newPage()
    await page.goto(url)
    console.log('OK2---------------------------------')
    const html = await page.content()
    const $ = cheerio.load(html);    

    // Extract the product title
    const title = $('h1.heading-5.v-fw-regular').text().trim().replace('Buy ', '');
    console.log(`title: ${title}`)
    const currentPrice = extractPrice(
      $('.priceView-hero-price.priceView-customer-price'),
    );
    console.log(`currentPrice: ${currentPrice}`)

    // const originalPrice = extractPrice(
    //   $('.buy-container__main-price--crossed')
    // );

    // const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images = 
      $('img[draggable="false"]') || '{}'

    let imageUrls: Array<string> = []
    images.each((i, image) => {
      imageUrls.push($(image).attr('src'))
    })
    console.log(imageUrls)
    
    

    // const currency = extractCurrency($('.a-price-symbol')) || '$'
    const currency = '$'
    // const discountRate = ((+currentPrice - +originalPrice) / +currentPrice) * 100

    // const description = extractDescription($)
    const description = $('.description-text.clamp.lv p').toString()
    console.log(`description: ${description}`)

    // Construct data object with scraped information
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      // currentPrice: Number(currentPrice) || Number(originalPrice),
      currentPrice: Number(currentPrice),
      // originalPrice: Number(originalPrice) || Number(currentPrice),
      originalPrice: Number(currentPrice),
      priceHistory: [],
      // discountRate: Number(discountRate),
      discountRate: 5,
      category: 'category',
      reviewsCount:100,
      stars: 4.5,
      // isOutOfStock: outOfStock,
      isOutOfStock: false,
      description,
      // lowestPrice: Number(currentPrice) || Number(originalPrice),
      lowestPrice: Number(currentPrice),
      // highestPrice: Number(originalPrice) || Number(currentPrice),
      highestPrice: Number(currentPrice),
      // averagePrice: Number(currentPrice) || Number(originalPrice),
      averagePrice: Number(currentPrice),
    }

    return data;
  } catch (error: any) {
    // console.log(error);
  }
}