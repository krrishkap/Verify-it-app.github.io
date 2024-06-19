// Function to create an article card
function createArticleCard(article) {
    return `
        <div class="col-md-3 mb-3">
            <a href="https://verify-it-app.github.io/verified.html?category=${article.category.toLowerCase()}&page=1&article=${article.id}" class="card position-relative">
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

// Function to create a category section
function createCategorySection(category, articles) {
    const categorySection = document.createElement('div');
    categorySection.classList.add('col', 'mb-4');
    categorySection.innerHTML = `
        <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
        <div class="row">
            ${articles.map(article => createArticleCard(article)).join('')}
        </div>
    `;
    document.getElementById('articles').appendChild(categorySection);
}

document.addEventListener('DOMContentLoaded', () => {
    const categories = ['politics', 'religious', 'scientific', 'international'];

    fetch('assets/article_page_numbers.json')
        .then(response => response.json())
        .then(pageNumbers => {
            categories.forEach(category => {
                const categoryLower = category.toLowerCase();
                const articleNumber = pageNumbers[category.charAt(0).toUpperCase() + category.slice(1)];
                fetch(`assets/${categoryLower}/${categoryLower}_article${articleNumber}.json`)
                    .then(response => response.json())
                    .then(articles => {
                        // Sort articles in descending order by date
                        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

                        // Limit articles to maximum 4 per category
                        const limitedArticles = articles.slice(0, 4);

                        createCategorySection(category, limitedArticles);
                    })
                    .catch(error => console.error('Error fetching articles:', error));
            });
        })
        .catch(error => console.error('Error fetching article page numbers:', error));
});