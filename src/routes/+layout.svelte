<script>
  import '$lib/global.css';
  import { addCollection } from '@iconify/svelte';
  import svgSpinners from '@iconify/json/json/svg-spinners.json';
  import lucideIcons from '@iconify/json/json/lucide.json';
  import octicon from '@iconify/json/json/octicon.json';
  import tablerIcons from '@iconify/json/json/tabler.json';

  addCollection(octicon);
  addCollection(lucideIcons);
  addCollection(svgSpinners);
  addCollection(tablerIcons);
</script>

<slot></slot>
