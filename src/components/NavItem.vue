<template>
    <div class="nav-item">
        <div class="nav-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                <g v-if="type === 'legend'"><path d="M120-120v-80h120v80H120Zm0-160v-80h320v80H120Zm0-160v-80h720v80H120Zm0-160v-80h320v80H120Zm0-160v-80h120v80H120Zm200 640v-80h120v80H320Zm0-640v-80h120v80H320Zm200 640v-80h120v80H520Zm0-160v-80h320v80H520Zm0-320v-80h320v80H520Zm0-160v-80h120v80H520Zm200 640v-80h120v80H720Zm0-640v-80h120v80H720Z"/></g>
                <g v-else-if="type === 'journey'"><path d="M760-120q-39 0-70-22.5T647-200H440q-66 0-113-47t-47-113q0-66 47-113t113-47h80q33 0 56.5-23.5T600-600q0-33-23.5-56.5T520-680H313q-13 35-43.5 57.5T200-600q-50 0-85-35t-35-85q0-50 35-85t85-35q39 0 69.5 22.5T313-760h207q66 0 113 47t47 113q0 66-47 113t-113 47h-80q-33 0-56.5 23.5T360-360q0 33 23.5 56.5T440-280h207q13-35 43.5-57.5T760-360q50 0 85 35t35 85q0 50-35 85t-85 35ZM200-680q17 0 28.5-11.5T240-720q0-17-11.5-28.5T200-760q-17 0-28.5 11.5T160-720q0 17 11.5 28.5T200-680Z"/></g>
                <g v-else-if="type === 'revisions'"><path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z"/></g>
                <g v-else-if="type === 'bot'"><path d="M160-360q-50 0-85-35t-35-85q0-50 35-85t85-35v-80q0-33 23.5-56.5T240-760h120q0-50 35-85t85-35q50 0 85 35t35 85h120q33 0 56.5 23.5T800-680v80q50 0 85 35t35 85q0 50-35 85t-85 35v160q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200v-160Zm200-80q25 0 42.5-17.5T420-500q0-25-17.5-42.5T360-560q-25 0-42.5 17.5T300-500q0 25 17.5 42.5T360-440Zm240 0q25 0 42.5-17.5T660-500q0-25-17.5-42.5T600-560q-25 0-42.5 17.5T540-500q0 25 17.5 42.5T600-440ZM320-280h320v-80H320v80Zm-80 80h480v-480H240v480Zm240-240Z"/></g>
                <g v-else-if="type === 'issues'"><path xmlns="http://www.w3.org/2000/svg" d="M480-79q-16 0-30.5-6T423-102L102-423q-11-12-17-26.5T79-480q0-16 6-31t17-26l321-321q12-12 26.5-17.5T480-881q16 0 31 5.5t26 17.5l321 321q12 11 17.5 26t5.5 31q0 16-5.5 30.5T858-423L537-102q-11 11-26 17t-31 6Zm0-80 321-321-321-321-321 321 321 321Zm-40-281h80v-240h-80v240Zm40 120q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320Zm0-160Z"/></g>
            </svg>
        </div>
        <div class="nav-item-text">
            {{ type }}
        </div>
    </div>
</template>

<style scoped>
    .nav-item {
        padding: 12px;
        transition: background-color 0.3s ease, color 0.3s ease;
        color: grey;
        cursor: pointer;
        border-radius: 4px;
        margin-top: 8px;
    }

    .nav-item:hover {
        background: skyblue;
        color: black;
    }

    .nav-item-text {
        text-align: center;
        text-transform: capitalize;
        font-size: 14px;
    }

    path {
        fill: currentColor;
    }
</style>

<script>
export default {
    name: 'NavItem',
    props: {
        type: String,
        validator: (value) => {
            return ['legend', 'journey', 'revisions', 'bot', 'issues'].includes(value);
        },
    },
    setup() {
        
    },
}
</script>