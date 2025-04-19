// Инициализация Supabase
const supabaseUrl = 'https://xvafqjzyjsmohoyiyeqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWZxanp5anNtb2hveWl5ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI2ODEsImV4cCI6MjA2MDMyODY4MX0.yI1HHIXMxy53MEw17GTh1tcKe9GcaDoUReZekF7S97g';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM элементы
const moviesContainer = document.getElementById('movies-container');
const titleInput = document.getElementById('title');
const yearInput = document.getElementById('year');
const posterInput = document.getElementById('poster');
const ratingInput = document.getElementById('rating');
const genreInput = document.getElementById('genre');
const categorySelect = document.getElementById('category-select');
const addBtn = document.getElementById('add-btn');

// Текущая категория
let currentCategory = 'all';
let cachedMovies = [];

// Загрузка фильмов
async function loadMovies(category = 'all') {
  try {
    let query = supabase.from('movies').select('*');
    
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: movies, error } = await query;
    
    if (error) throw error;
    
    cachedMovies = movies || [];
    renderMovies(cachedMovies);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  }
}

// Отображение фильмов
function renderMovies(movies) {
  moviesContainer.innerHTML = '';
  movies.forEach(movie => {
    moviesContainer.innerHTML += createMovieCard(movie);
  });
}

// Создание карточки фильма (сохраняем ваш формат)
function createMovieCard(movie) {
  return `
    <div class="movie-card" data-category="${movie.category}">
      <span class="movie-category">${getCategoryName(movie.category)}</span>
      <button class="delete-btn" data-id="${movie.id}">×</button>
      <img src="${movie.poster || 'https://via.placeholder.com/300x450'}" alt="${movie.title}">
      <h3>${movie.title} (${movie.year})</h3>
      ${movie.rating ? `<p>Рейтинг: ${movie.rating}/10</p>` : ''}
      ${movie.genre ? `<p>Жанр: ${movie.genre}</p>` : ''}
    </div>
  `;
}

// Получение названия категории
function getCategoryName(category) {
  const names = {
    movie: 'Фильм',
    series: 'Сериал',
    cartoon: 'Мультфильм',
    anime: 'Аниме'
  };
  return names[category] || '';
}

// Добавление фильма (сохраняем ваш формат данных)
async function addMovie() {
  const title = titleInput.value.trim();
  const year = yearInput.value.trim();
  const posterUrl = posterInput.value.trim();
  const rating = ratingInput.value.trim();
  const genre = genreInput.value.trim();
  const category = categorySelect.value;

  if (!title || !year) return;

  try {
    const { data, error } = await supabase
      .from('movies')
      .insert([{ 
        title, 
        year, 
        poster: posterUrl, 
        rating: rating || null,
        genre: genre || null,
        category 
      }]);
    
    if (error) throw error;
    
    // Очищаем поля
    titleInput.value = '';
    yearInput.value = '';
    posterInput.value = '';
    ratingInput.value = '';
    genreInput.value = '';
    
    loadMovies(currentCategory);
  } catch (error) {
    console.error('Ошибка добавления:', error);
  }
}

// Удаление фильма
async function deleteMovie(id) {
  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    loadMovies(currentCategory);
  } catch (error) {
    console.error('Ошибка удаления:', error);
  }
}

// Обработчики событий
addBtn.addEventListener('click', addMovie);

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    deleteMovie(id);
  }
});

// Обработчики кнопок категорий
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.category;
    loadMovies(currentCategory);
    
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Первоначальная загрузка
loadMovies();
