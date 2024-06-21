function createArticleCard(article, pageNumber) {
    return `
        <div class="col-md-3 mb-3">
            <a href="verified.html?category=${article.category.toLowerCase()}&page=${pageNumber}&article=${article.id}" class="card position-relative">
                <div class="status-overlay">
                    <img src="${article.statusImage}" alt="Status" class="status-image">
                    <span class="status-text">${article.status}</span>
                </div>
                <img src="${article.image}" class="card-img-top article-image" alt="${article.title}">
                <div class="category-label">${article.category}</div>
                <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text"><small class="text-muted">By ${article.author} on ${article.date}</small></p>
                </div>
            </a>
        </div>
    `;
}


function createCategorySection(category, articles, pageNumber) {
    const categorySection = document.createElement('div');
    categorySection.classList.add('col', 'mb-4');
    categorySection.innerHTML = `
        <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
        <div class="row">
            ${articles.map(article => createArticleCard(article, pageNumber)).join('')}
        </div>
    `;
    document.getElementById('articles').appendChild(categorySection);
}


document.addEventListener('DOMContentLoaded', () => {
    const categories = ['politics', 'religious', 'scientific', 'international'];

    fetch('assets/article_page_numbers.json')
        .then(response => response.json())
        .then(pageNumbers => {
            const fetchPromises = categories.map(category => {
                const categoryLower = category.toLowerCase();
                const pageNumber = pageNumbers[category.charAt(0).toUpperCase() + category.slice(1)];
                return fetch(`assets/${categoryLower}/${categoryLower}_article${pageNumber}.json`)
                    .then(response => response.json())
                    .then(articles => {
                        // Sort articles in descending order by date
                        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

                        // Limit articles to maximum 4 per category
                        const limitedArticles = articles.slice(0, 4);

                        createCategorySection(category, limitedArticles, pageNumber);
                    })
                    .catch(error => console.error('Error fetching articles:', error));
            });

            Promise.all(fetchPromises)
                .then(() => {
                    // All content has loaded, delay hiding the loading screen by 2 seconds
                    setTimeout(() => {
                        document.getElementById('loading-screen').style.display = 'none';
                    }, 1000); // 2000 milliseconds = 2 seconds
                })
                .catch(error => console.error('Error fetching articles:', error));
        })
        .catch(error => console.error('Error fetching article page numbers:', error));
});


