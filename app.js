document.addEventListener('DOMContentLoaded', () => {
  // Инициализация Supabase
  const supabaseUrl = 'https://xvafqjzyjsmohoyiyeqs.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YWZxanp5anNtb2hveWl5ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTI2ODEsImV4cCI6MjA2MDMyODY4MX0.yI1HHIXMxy53MEw17GTh1tcKe9GcaDoUReZekF7S97g';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  const moviesList = document.getElementById('movies-list');
  const addForm = document.getElementById('add-movie');
  let currentCategory = 'all';

  // Показываем/скрываем контролы для сериалов
  document.getElementById('movie-category').addEventListener('change', function() {
    document.getElementById('series-controls').style.display = 
      this.value === 'series' ? 'block' : 'none';
  });

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

      if (!movies || movies.length === 0) {
        moviesList.innerHTML = '<p>Фильмов нет. Добавьте первый!</p>';
        return;
      }

      const planned = movies.filter(m => m.status === 'planned');
      const watching = movies.filter(m => m.status === 'watching');
      const watched = movies.filter(m => m.status === 'watched');

      moviesList.innerHTML = `
        <div class="movie-block">
          <h2>Хочу посмотреть</h2>
          <div class="movies-grid">
            ${planned.map(renderMovieCard).join('')}
          </div>
        </div>
        <div class="movie-block">
          <h2>Смотрю</h2>
          <div class="movies-grid">
            ${watching.map(renderMovieCard).join('')}
          </div>
        </div>
        <div class="movie-block">
          <h2>Просмотрено</h2>
          <div class="movies-grid">
            ${watched.map(renderMovieCard).join('')}
          </div>
        </div>
      `;

      // Обработчики кнопок
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteMovie);
      });
      document.querySelectorAll('.start-watching-btn').forEach(btn => {
        btn.addEventListener('click', startWatching);
      });
      document.querySelectorAll('.add-episode-btn').forEach(btn => {
        btn.addEventListener('click', addEpisode);
      });

    } catch (err) {
      console.error('Ошибка загрузки:', err);
      moviesList.innerHTML = '<p>Ошибка загрузки. Обновите страницу.</p>';
    }
  }

  function renderMovieCard(movie) {
    const isSeries = movie.is_series;
    const isPlanned = movie.status === 'planned';
    const isWatching = movie.status === 'watching';
    
    const watchButton = isSeries && isPlanned ? `
      <button class="start-watching-btn">Начать смотреть</button>
    ` : '';

    const progressBar = isSeries && isWatching ? `
      <div class="progress-container">
        <div class="progress-bar" style="width: ${(movie.watched_episodes / movie.total_episodes) * 100}%"></div>
        <span>${movie.watched_episodes}/${movie.total_episodes}</span>
      </div>
      <button class="add-episode-btn">+1 серия</button>
    ` : '';

    return `
      <div class="movie-card" data-id="${movie.id}" data-category="${movie.category}">
        <span class="category-badge">${getCategoryName(movie.category)}</span>
        <div class="poster-wrapper">
          <img src="${movie.poster_url || 'https://pp.userapi.com/c4567/u3725485/a_9c32eaa3.jpg'}" alt="${movie.title}">
        </div>
        <h3>${movie.title} (${movie.year})</h3>
        <p>★ ${movie.rating || '-'} | ${movie.genre || '-'}</p>
        ${watchButton}
        ${progressBar}
        <button class="delete-btn">Удалить</button>
      </div>
    `;
  }

  async function startWatching(e) {
    const movieId = e.target.closest('.movie-card').dataset.id;
    try {
      const { error } = await supabase
        .from('movies')
        .update({ 
          status: 'watching',
          watched_episodes: 0
        })
        .eq('id', movieId);
      
      if (error) throw error;
      loadMovies(currentCategory);
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось изменить статус');
    }
  }

  async function addEpisode(e) {
    const movieId = e.target.closest('.movie-card').dataset.id;
    try {
      const { data: movie, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId)
        .single();

      if (error || !movie) return;

      const newCount = movie.watched_episodes + 1;
      const isComplete = newCount >= movie.total_episodes;

      await supabase
        .from('movies')
        .update({
          watched_episodes: newCount,
          status: isComplete ? 'watched' : 'watching'
        })
        .eq('id', movieId);

      loadMovies(currentCategory);
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось обновить счётчик серий');
    }
  }

  async function deleteMovie(e) {
    if (!confirm('Удалить этот фильм?')) return;
    const movieId = e.target.closest('.movie-card').dataset.id;
    try {
      const { error } = await supabase.from('movies').delete().eq('id', movieId);
      if (error) throw error;
      loadMovies(currentCategory);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить фильм');
    }
  }

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isSeries = document.getElementById('movie-category').value === 'series';
    
    const movie = {
      title: document.getElementById('title').value,
      year: parseInt(document.getElementById('year').value),
      rating: parseFloat(document.getElementById('rating').value) || null,
      genre: document.getElementById('genre').value || null,
      poster_url: document.getElementById('poster_url').value || 'https://pp.userapi.com/c4567/u3725485/a_9c32eaa3.jpg',
      category: document.getElementById('movie-category').value,
      status: 'planned',
      is_series: isSeries,
      total_episodes: isSeries ? parseInt(document.getElementById('total-episodes').value) : null,
      watched_episodes: isSeries ? 0 : null
    };

    try {
      const { error } = await supabase.from('movies').insert([movie]);
      if (error) throw error;
      e.target.reset();
      document.getElementById('series-controls').style.display = 'none';
      loadMovies(currentCategory);
    } catch (err) {
      console.error('Ошибка добавления:', err);
      alert('Ошибка при добавлении фильма');
    }
  });

  function getCategoryName(category) {
    const categories = {
      movie: 'Фильм',
      series: 'Сериал',
      cartoon: 'Мультфильм',
      anime: 'Аниме'
    };
    return categories[category] || '';
  }

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      loadMovies(currentCategory);
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  loadMovies();
});
