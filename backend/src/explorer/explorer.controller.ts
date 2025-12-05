import { Controller, Get, Query, Param } from '@nestjs/common';
import axios from 'axios';

@Controller('api/explorer')
export class ExplorerController {
  
  @Get('pokemons')
  async getPokemons(@Query('page') page = '1') {
    const limit = 20;
    const offset = (Number(page) - 1) * limit;

    // Chama a API pública
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    
    // Formata os dados para o Frontend
    const results = response.data.results.map((p: any) => {
      // Extrai o ID da URL (ex: https://pokeapi.co/api/v2/pokemon/1/)
      const parts = p.url.split('/');
      const id = parts[parts.length - 2];
      return {
        id,
        name: p.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
      };
    });

    return {
      data: results,
      total: response.data.count,
      page: Number(page)
    };
  }

  @Get('pokemons/:id')
  async getPokemonDetail(@Param('id') id: string) {
    try {
      const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
      
      return {
        id: data.id,
        name: data.name,
        height: data.height / 10, // Converter para metros
        weight: data.weight / 10, // Converter para kg
        types: data.types.map((t: any) => t.type.name),
        abilities: data.abilities.map((a: any) => a.ability.name),
        stats: data.stats.map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat
        })),
        image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default
      };
    } catch (error) {
      return { error: "Pokémon não encontrado" };
    }
  }
}