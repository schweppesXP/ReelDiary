// Полный рабочий код для Supabase (просто подставьте свои данные)

// 1. Ждем полной загрузки страницы и библиотеки Supabase
document.addEventListener('DOMContentLoaded', function() {

  // 2. Ваши данные из Supabase (ЗАМЕНИТЕ ЭТО НА СВОЁ)
  const supabaseUrl = 'https://xvafqjzyjsmohoyiyeqs.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWZxanp5anNtb2hveWl5ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI2ODEsImV4cCI6MjA2MDMyODY4MX0.yI1HHIXMxy53MEw17GTh1tcKe9GcaDoUReZekF7S97g';

  // 3. Инициализация Supabase (не меняйте эту строку)
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // 4. Проверка подключения (можно удалить после теста)
  console.log('Supabase подключен!');

  // 5. Загрузка фильмов
  async function loadMovies() {
    try {
      const { data: movies, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const moviesList = document.getElementById('movies-list');
      moviesList.innerHTML = movies.map(movie => `
        <div class="movie-card" data-id="${movie.id}">
          <img src="${movie.poster_url}" alt="${movie.title}">
          <h3>${movie.title} (${movie.year})</h3>
          <p>★ ${movie.rating || '-'} | ${movie.genre || '-'}</p>
          <button class="delete-btn">Удалить</button>
        </div>
      `).join('');

      // Вешаем обработчики удаления
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Удалить фильм?')) return;
          const movieId = btn.closest('.movie-card').dataset.id;
          const { error } = await supabase
            .from('movies')
            .delete()
            .eq('id', movieId);
          if (!error) loadMovies();
        });
      });

    } catch (err) {
      console.error('Ошибка загрузки:', err);
      alert('Не удалось загрузить фильмы');
    }
  }

  // 6. Добавление нового фильма
  document.getElementById('add-movie').addEventListener('submit', async function(e) {
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
      
      e.target.reset();
      loadMovies();
      alert('Фильм добавлен!');
    } catch (err) {
      console.error('Ошибка добавления:', err);
      alert('Ошибка при добавлении фильма');
    }
  });

  // 7. Первая загрузка при открытии страницы
  loadMovies();
});