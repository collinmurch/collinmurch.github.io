<script>
    const { children } = $props();
</script>

<div class="container">
    {@render children()}
</div>

<style>
    .container {
        max-width: 80ch;
        margin: 0 auto;
    }
</style>
