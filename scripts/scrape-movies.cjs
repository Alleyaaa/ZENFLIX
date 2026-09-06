import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

dotenv.config();
async function seed() {
  let seeded = 0, errors = 0
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`)
    const data = await res.json()
    for (const m of data.results) {
      // Contoh hardcode embed link (ganti dengan scrape ke IDLIX mirror / source streaming)
      const embedUrl = `https://vidcloud9.com/ajax/embed/playere?url=movie/${m.id}`
      const { error } = await supabase.from('movies').upsert({
        tmdb_id: m.id,
        title: m.title,
        year: m.release_date?.split('-')[0] || null,
        poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        embed_url: embedUrl,
      })
      if (error) { errors++; console.log(error.message) } else seeded++
    }
  }
  console.log(`✅  Seeded ${seeded} movies, ${errors} errors`)
}
seed()