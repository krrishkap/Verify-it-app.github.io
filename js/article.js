
    var currentArticle = 1;

    
    function generateArticleHTML(article) {
      return `
        <section class="container article-section ${article.id === 1 ? 'active' : ''}" id="article${article.id}">
          <div class="article-content">
            <div class="overlay-status">
              <img src="${article.statusImage}" alt="Status">
              ${article.status}
            </div>
            <img src="${article.image}" class="d-block w-100" alt="${article.title}">
            <div class="carousel-details">
              <p><strong>Category:</strong> ${article.category}</p>
              <p><strong>Date:</strong> ${article.date}</p>
              <p><strong>Author:</strong> ${article.author}</p>
              <p><strong>Source:</strong> <a href="${article.source}">${article.sourceText}</a></p>
              <p><strong>Status:</strong> ${article.status}</p>
            </div>
            <h2 class="article-header">${article.title}</h2>
            <div class="fact-check-content">
              <h3>Claim</h3>
              <p>${article.claim}</p>
              ${article.claimTweet ? `
                <blockquote class="twitter-tweet">
                  <p lang="en" dir="ltr">${article.claim}</p>&mdash; Source (<a href="${article.claimTweet}">Tweet</a>)
                </blockquote>
                <div id="twitter-widget-container"></div>
              ` : ''}
              <h3>Reality</h3>
              <img src="${article.realityImage}" class="d-block w-100" alt="Reality Image">
              <p>${article.realityText}</p>
            </div>
            <div class="article-navigation">
              <div class="navigation-container">
                <a class="btn btn-primary" href="#" onclick="changeArticle(-1)">Previous</a>
                <div class="navigation-info"></div>
                <a class="btn btn-primary" href="#" onclick="changeArticle(1)">Next</a>
              </div>
            </div>
          </div>
        </section>
      `;
    }
    


function populatePageNumbers(category) {
  var pageNumbers = getPageNumbers(category);
  var pageNumberDropdown = document.getElementById('pageNumber');
  pageNumberDropdown.innerHTML = '';
  
  if (pageNumbers.length > 0) {
    pageNumbers.forEach(page => {
      var option = document.createElement('option');
      option.value = page;
      option.textContent = '' + page;
      pageNumberDropdown.appendChild(option);
    });
    
    // Set the page number dropdown to the value from the URL or default value
    var defaultPage = getURLParameters().page || pageNumbers[0];
    document.getElementById('pageNumber').value = defaultPage;
    
    loadArticles();
  }
}



  
  function getPageNumbers(category) {
   
    var pageNumbers = {
      politics: [1],
      religious: [1],
      scientific: [1, 2],
      international: [1]
      
    };
    return pageNumbers[category] || [];
  }


function updateJsonFileName(category, pageNumber) {
 
  return 'assets/' + category + '/' + category + '_article' + pageNumber + '.json';
}

function getURLParameters() {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category') || 'politics', // Default to 'politics' if not present
    page: params.get('page') || '1', // Default to page 1 if not present
    article: params.get('article') || '1' // Default to article 1 if not present
  };
}



function loadArticles() {
  return new Promise((resolve, reject) => {
    var selectedCategory = document.getElementById('categoryFilter').value;
    var selectedPageNumber = document.getElementById('pageNumber').value;
    var jsonFileName = updateJsonFileName(selectedCategory, selectedPageNumber);
    fetch(jsonFileName)
      .then(response => response.json())
      .then(articles => {
        const container = document.getElementById('articles-container');
        container.innerHTML = ''; 
        articles.forEach(article => {
          container.innerHTML += generateArticleHTML(article);
        });
        updateNavigationButtons();
        loadTwitterWidgets();

        if (articles.length > 0) {
          // Set the document title based on the first article
          document.title = articles[0].title + ' - Verify-it';
        }
        resolve(); // Resolve the promise after articles are loaded
      })
      .catch(error => {
        console.error('Error loading articles:', error);
        reject(error); // Reject the promise if there's an error
      });
  });
}


  
document.getElementById('categoryFilter').addEventListener('change', function () {
  var selectedCategory = this.value;
  populatePageNumbers(selectedCategory); 
  loadArticles().then(() => {
    currentArticle = 1; 
    updateURL(selectedCategory, document.getElementById('pageNumber').value, currentArticle); 
    changeArticle(0); // Highlight the first article
  });
});

document.getElementById('pageNumber').addEventListener('change', function () {
  var selectedCategory = document.getElementById('categoryFilter').value;
  var selectedPageNumber = this.value;
  loadArticles().then(() => {
    currentArticle = 1; 
    updateURL(selectedCategory, selectedPageNumber, currentArticle); 
    changeArticle(0); // Highlight the first article
  });
});




function loadTwitterWidgets() {
  
  var container = document.getElementById('twitter-widget-container');
  if (container) {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
    script.setAttribute('charset', 'utf-8');
    script.setAttribute('async', '');
    container.appendChild(script);
  } else {
    console.error('Twitter widget container not found.');
  }
}

window.onload = function () {
  const { category, page, article } = getURLParameters();
  
  // Set the dropdowns to the values from the URL or default values
  document.getElementById('categoryFilter').value = category;
  populatePageNumbers(category);
  
  // Set the page number dropdown after populating it
  document.getElementById('pageNumber').value = page;
  
  // Load articles based on the selected category and page
  loadArticles().then(() => {
    // After loading articles, navigate to the specific article
    currentArticle = parseInt(article, 10);
    changeArticle(0); // This will highlight the correct article
  });
};


function changeArticle(offset) {
  var totalArticles = document.querySelectorAll('.article-section').length;
  currentArticle += offset;

  if (currentArticle < 1) {
    currentArticle = 1;
  } else if (currentArticle > totalArticles) {
    currentArticle = totalArticles;
  }

  document.querySelectorAll('.article-section').forEach(function (article) {
    article.classList.remove('active');
  });

  var activeArticle = document.getElementById('article' + currentArticle);
  activeArticle.classList.add('active');
  
  // Update the document title based on the active article
  var articleTitle = activeArticle.querySelector('.article-header').textContent;
  document.title = articleTitle + ' - Verify-it';

  var selectedCategory = document.getElementById('categoryFilter').value;
  var selectedPageNumber = document.getElementById('pageNumber').value;

  updateURL(selectedCategory, selectedPageNumber, currentArticle);
  
  updateNavigationButtons();
}


   
function updateNavigationButtons() {
  var prevButton = document.querySelector('.article-navigation a[onclick="changeArticle(-1)"]');
  var nextButton = document.querySelector('.article-navigation a[onclick="changeArticle(1)"]');
  var totalArticles = document.querySelectorAll('.article-section').length;

  if (currentArticle === 1) {
    prevButton.classList.add('disabled');
  } else {
    prevButton.classList.remove('disabled');
  }

  if (currentArticle === totalArticles) {
    nextButton.classList.add('disabled');
  } else {
    nextButton.classList.remove('disabled');
  }

 
  document.getElementById('article-navigation-info').textContent = `${currentArticle} of ${totalArticles}`;
}

document.addEventListener("DOMContentLoaded", function() {
    var scrollToTopBtn = document.getElementById("scrollToTopBtn");
  
   
    window.onscroll = function() {scrollFunction()};
  
    function scrollFunction() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = "block";
      } else {
        scrollToTopBtn.style.display = "none";
      }
    }
  
    
    scrollToTopBtn.addEventListener("click", function() {
      scrollToTop();
    });
  
    function scrollToTop() {
      var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, currentScroll - (currentScroll / 8));
      }
    }
  });

  
function updateURL(category, pageNumber, articleNumber) {
  const newURL = `${window.location.origin}${window.location.pathname}?category=${category}&page=${pageNumber}&article=${articleNumber}`;
  window.history.pushState({ path: newURL }, '', newURL);
}


document.getElementById('categoryFilter').addEventListener('change', function () {
  var selectedCategory = this.value;
  populatePageNumbers(selectedCategory); 
  loadArticles(); 
  currentArticle = 1; 
  updateURL(selectedCategory, document.getElementById('pageNumber').value, currentArticle); 
});


document.getElementById('pageNumber').addEventListener('change', function () {
  var selectedCategory = document.getElementById('categoryFilter').value;
  var selectedPageNumber = this.value;
  loadArticles(); 
  currentArticle = 1; 
  updateURL(selectedCategory, selectedPageNumber, currentArticle); 
});




