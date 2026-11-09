import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = document.querySelector('input[name="search-text"]');
const loadMoreBtn = document.querySelector('.btn-load-more');
const gallery = document.querySelector('.gallery');
let searchQuery = input.value.trim();
let page = 1;

async function loadImages() {
  showLoader();
  hideLoadMoreButton();
  try {
    const data = await getImagesByQuery(searchQuery, page);
    if (data.hits.length === 0) {
      iziToast.warning({
        title: 'Warning',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }
    createGallery(data.hits);
    if (page < Math.ceil(data.totalHits / 15)) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: `We're sorry, but you've reached the end of search results.`,
      });
    }
  } catch (error) {
    iziToast.error({ message: error.message });
    throw error;
  } finally {
    hideLoader();
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  searchQuery = input.value.trim();
  if (searchQuery === '') {
    iziToast.warning({
      title: 'Warning',
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
    return;
  }
  clearGallery();
  hideLoadMoreButton();
  page = 1;
  try {
    await loadImages();
  } catch (error) {}
});

loadMoreBtn.addEventListener('click', async () => {
  const currentPage = page;
  page += 1;
  try {
    await loadImages();
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
  } catch (error) {
    page = currentPage;
    showLoadMoreButton();
  }
});
