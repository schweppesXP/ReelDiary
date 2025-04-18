// Инициализация Supabase (замените значения на свои!)
const supabaseUrl = 'https://xvafqjzyjsmohoyiyeqs.supabase.co'; // Ваш URL из Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWZxanp5anNtb2hveWl5ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI2ODEsImV4cCI6MjA2MDMyODY4MX0.yI1HHIXMxy53MEw17GTh1tcKe9GcaDoUReZekF7S97g'; // Ваш "anon public" ключ из Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// DOM-элементы
const moviesList = document.getElementById('movies-list');
const addMovieForm = document.getElementById('add-movie');

// Загрузка фильмов
async function loadMovies() {
  try {
    moviesList.innerHTML = '<p>Загрузка...</p>';
    
    const { data: movies, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (movies.length === 0) {
      moviesList.innerHTML = '<p>Фильмов нет. Добавьте первый!</p>';
      return;
    }

    moviesList.innerHTML = movies.map(movie => `
      <div class="movie-card" data-id="${movie.id}">
        <img src="${movie.poster_url || 'https://via.placeholder.com/200x300'}" alt="${movie.title}">
        <h3>${movie.title} (${movie.year})</h3>
        <p>★ ${movie.rating || '—'} | ${movie.genre || '—'}</p>
        <button class="delete-btn">Удалить</button>
      </div>
    `).join('');

    // Вешаем обработчики удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', deleteMovie);
    });

  } catch (err) {
    console.error('Ошибка загрузки:', err);
    moviesList.innerHTML = '<p>Ошибка загрузки. Обновите страницу.</p>';
  }
}

// Удаление фильма
async function deleteMovie(e) {
  if (!confirm('Удалить этот фильм?')) return;
  
  const movieId = e.target.closest('.movie-card').dataset.id;
  
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
addMovieForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const movie = {
    title: document.getElementById('title').value,
    year: parseInt(document.getElementById('year').value),
    rating: parseFloat(document.getElementById('rating').value) || null,
    genre: document.getElementById('genre').value || null,
    poster_url: document.getElementById('poster_url').value || 'https://via.placeholder.com/200x300'
  };

  try {
    const { error } = await supabase
      .from('movies')
      .insert([movie]);

    if (error) throw error;
    
    addMovieForm.reset();
    loadMovies();
  } catch (err) {
    console.error('Ошибка добавления:', err);
    alert('Ошибка при добавлении фильма');
  }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadMovies();
});
