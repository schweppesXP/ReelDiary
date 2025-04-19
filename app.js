// Ждем полной загрузки страницы И библиотеки Supabase
document.addEventListener('DOMContentLoaded', () => {
  // 1. Проверяем, что Supabase загружен
  if (!window.supabase) {
    console.error('Supabase не загружен! Проверьте подключение скрипта в HTML');
    return;
  }

// Инициализация Supabase (ВСТАВЬТЕ СВОИ ДАННЫЕ)
const supabaseUrl = 'https://xvafqjzyjsmohoyiyeqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWZxanp5anNtb2hveWl5ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI2ODEsImV4cCI6MjA2MDMyODY4MX0.yI1HHIXMxy53MEw17GTh1tcKe9GcaDoUReZekF7S97g';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 3. Проверка подключения
console.log('Supabase подключен:', supabase);


// DOM элементы
const moviesList = document.getElementById('movies-list');
const addForm = document.getElementById('add-movie');

// ========================
// ВСЕ ФУНКЦИИ ПРИЛОЖЕНИЯ
// ========================

// Загрузка фильмов
async function loadMovies() {
  try {
    moviesList.innerHTML = '<p class="loading">Загрузка фильмов...</p>';
    
    const { data: movies, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (movies.length === 0) {
      moviesList.innerHTML = '<p class="empty">Фильмов пока нет. Добавьте первый!</p>';
      return;
    }
    
    renderMovies(movies);
    initDeleteHandlers();
    
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    moviesList.innerHTML = '<p class="error">Ошибка загрузки. Обновите страницу.</p>';
  }
}

// Отрисовка фильмов
function renderMovies(movies) {
  moviesList.innerHTML = movies.map(movie => `
    <div class="movie-card" data-id="${movie.id}">
      <img src="${movie.poster_url || 'https://via.placeholder.com/200x300'}" 
           alt="${movie.title}" 
           onerror="this.src='https://via.placeholder.com/200x300'">
      <h3>${movie.title} (${movie.year})</h3>
      <p>★ ${movie.rating || '—'} | ${movie.genre || '—'}</p>
      <button class="delete-btn">Удалить</button>
    </div>
  `).join('');
}

// Инициализация кнопок удаления
function initDeleteHandlers() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const movieId = btn.closest('.movie-card').dataset.id;
      if (confirm('Удалить этот фильм?')) {
        await deleteMovie(movieId);
      }
    });
  });
}

// Удаление фильма
async function deleteMovie(movieId) {
  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', movieId);
    
    if (error) throw error;
    loadMovies();
  } catch (err) {
    console.error('Ошибка удаления:', err);
    alert('Не удалось удалить фильм');
  }
}

// Добавление фильма
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const movie = {
    title: document.getElementById('title').value.trim(),
    year: parseInt(document.getElementById('year').value),
    rating: parseFloat(document.getElementById('rating').value) || null,
    genre: document.getElementById('genre').value.trim() || null,
    poster_url: document.getElementById('poster_url').value.trim() || null
  };

  try {
    const { error } = await supabase
      .from('movies')
      .insert([movie]);
    
    if (error) throw error;
    
    addForm.reset();
    loadMovies();
  } catch (err) {
    console.error('Ошибка добавления:', err);
    alert('Ошибка при добавлении фильма');
  }
});

// ========================
// ЗАПУСК ПРИЛОЖЕНИЯ
// ========================
document.addEventListener('DOMContentLoaded', () => {
  // Проверка инициализации Supabase
  if (!window.supabase) {
    console.error('Supabase не загружен!');
    return;
  }
  
  console.log('Supabase инициализирован:', supabase);
  loadMovies();
});
