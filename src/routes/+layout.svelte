<script>
    import "../app.css";
    const { children } = $props();
</script>

{#key children}
    {@render children()}
{/key}
