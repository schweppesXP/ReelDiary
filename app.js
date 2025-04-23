document.addEventListener('DOMContentLoaded', () => {
  // Инициализация Supabase
  const supabaseUrl = 'https://xvafqjzyjsmohoyiyeqs.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWZxanp5anNtb2hveWl5ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI2ODEsImV4cCI6MjA2MDMyODY4MX0.yI1HHIXMxy53MEw17GTh1tcKe9GcaDoUReZekF7S97g';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // DOM элементы
  const moviesList = document.getElementById('movies-list');
  const addForm = document.getElementById('add-movie');
  let currentCategory = 'all';

  // Функция загрузки фильмов
  async function loadMovies(category = 'all') {
    try {
      moviesList.innerHTML = '<p>Загрузка...</p>';
      
      let query = supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data: movies, error } = await query;

      if (error) throw error;

      if (movies.length === 0) {
        moviesList.innerHTML = '<p>Фильмов нет. Добавьте первый!</p>';
        return;
      }

      moviesList.innerHTML = movies.map(movie => `
        <div class="movie-card" data-id="${movie.id}" data-category="${movie.category || 'movie'}">
          <span class="category-badge">${getCategoryName(movie.category)}</span>
          <img src="${movie.poster_url || 'https://via.placeholder.com/200x300'}" alt="${movie.title}">
          <h3>${movie.title} (${movie.year})</h3>
          <p>★ ${movie.rating || '-'} | ${movie.genre || '-'}</p>
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

  // Удаление фильма (без изменений)
  async function deleteMovie(e) {
    if (!confirm('Удалить этот фильм?')) return;
    
    const movieId = e.target.closest('.movie-card').dataset.id;
    
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieId);

      if (error) throw error;
      loadMovies(currentCategory);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить фильм');
    }
  }

  // Добавление фильма (с категорией)
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const movie = {
      title: document.getElementById('title').value,
      year: parseInt(document.getElementById('year').value),
      rating: parseFloat(document.getElementById('rating').value) || null,
      genre: document.getElementById('genre').value || null,
      poster_url: document.getElementById('poster_url').value || 'https://steamuserimages-a.akamaihd.net/ugc/2079019457927111911/45068F1A462AF6EB757ADABDD621AB5FDE49E38E/?imw=512&amp;imh=512&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true',
      category: document.getElementById('movie-category').value || 'movie'
    };

    try {
      const { error } = await supabase
        .from('movies')
        .insert([movie]);

      if (error) throw error;
      
      e.target.reset();
      loadMovies(currentCategory);
    } catch (err) {
      console.error('Ошибка добавления:', err);
      alert('Ошибка при добавлении фильма');
    }
  });

  // Вспомогательная функция для категорий
  function getCategoryName(category) {
    const categories = {
      movie: 'Фильм',
      series: 'Сериал',
      cartoon: 'Мультфильм',
      anime: 'Аниме'
    };
    return categories[category] || '';
  }

  // Обработчики кнопок категорий
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      loadMovies(currentCategory);
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Запускаем приложение
  loadMovies();
});
