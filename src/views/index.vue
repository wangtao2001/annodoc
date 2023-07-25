<script setup lang="tsx">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { statusStore } from '@/store'
import { MessagePlugin } from 'tdesign-vue-next'
import { UserRole } from '@/interface'
import { SearchIcon,NotificationFilledIcon, UserCircleIcon, ChevronDownIcon, HomeIcon, CloseIcon, ChartBubbleIcon,
    DashboardIcon, Edit1Icon, ServerIcon, FilterClearIcon, SettingIcon, FormatVerticalAlignRightIcon
} from 'tdesign-icons-vue-next' // 这里能否auto-import?
 
const current = statusStore()

const toHome = () => {
    window.location.href = "/"
}
// 为了解决刷新后路由与当前选中的menu-item不同的情况
// 本来想用onMounted，但是setup的执行时机比mounted早
const route = useRoute() // 获取当前路由信息
const router = useRouter()
const currentItem = ref(route.path.split('/')[1]) // 例如'/anno/work'只要anno，这样就要求路由的路径与muen-item的value相同

const lightMode = ref(true)

const titleImg = ref('/title5.png')
const modeChange = ()=> {
    if (lightMode.value) {
        document.documentElement.setAttribute('theme-mode', 'dark')
        titleImg.value = '/title6.png'
        localStorage.setItem('lightMode', 'false')
    } else {
        document.documentElement.setAttribute('theme-mode', 'light')
        titleImg.value = '/title5.png'
        localStorage.setItem('lightMode', 'true')
    }
    lightMode.value = !lightMode.value
}
const local = localStorage.getItem('lightMode')
// 判断local为null
if(local === 'false') {
    modeChange()
}

const menuVisible = ref(false)
const closeMenu = () => {
    menuVisible.value = false
}

const dropdownOption = [
    {content: '退出登录', value: -1}
]

const dropdownClick = (row: any) => {
    if (row.value === -1) {
        logout()
    }
}

const logout = () => {
    window.location.href = 'http://id.cpu.edu.cn/sso/logout?service=https://anno.cpu.edu.cn'
    MessagePlugin.warning("正在退出, 即将返回登录页")
}

const userRolesSelect :Array<{content: string, value: number}> = []
const currentRoleName = computed(()=> {
    if (current.user.role == UserRole.student) {
        return current.user.grade
    } else if (current.user.role == UserRole.teacher) {
        return "管理员"
    } else if (current.user.role == UserRole.checker) {
        return "审核员"
    }
    
})
const userRoleChange = (row: any) =>{
    var changedRole = UserRole.student
    if (row.value == 2) {
        changedRole = UserRole.teacher
    } else if (row.value == 1) {
        changedRole = UserRole.checker
    }
    if (changedRole != current.user.role) {
        current.user.role = changedRole
        // 重新进入路由
        if (changedRole == UserRole.student && route.name != 'home' && route.name != 'anno_work' && route.name != 'anno_type' && route.name != 'anno_result') {
            router.push('/home')  
        } else if (changedRole == UserRole.checker && route.name != 'anno_work' && route.name != 'anno_type' && route.name != 'anno_result') {
            router.push('/anno')
        } else if (changedRole == UserRole.teacher && route.name == 'home') {
            router.push('/anno')
        }
    }
    currentItem.value = route.path.split('/')[1]
    menuVisible.value = false
}
// 能这样写是因为在进入路由器按已经获取到了身份信息
if (current.userRoles.length !=0) {
        for (var r of current.userRoles) {
        if(r == UserRole.student) {
            userRolesSelect.push({
                content: current.user.grade, value: 0
            })
        } else if (r == UserRole.checker) {
            userRolesSelect.push({
                content: "审核员", value: 1
            })
        } else {
            userRolesSelect.push({
                content: "管理员", value: 2
            })
        }
    }
}

</script>

<template>
    <t-layout class="root">
        <t-header >
            <t-head-menu height="120px">
                <template #logo>
                    <img style="user-select: none;" @click="toHome" width="180" class="logo" :src="titleImg" alt="logo" />
                </template>
                <t-menu-item class="s" style="margin-right: 5px;"> 工作区 </t-menu-item>
                <t-button class="s"  theme="default" variant="text" @click="modeChange" value="item2">{{ lightMode ? '深色模式' : '浅色模式' }}</t-button>
                <template #operations>
                    <SearchIcon class="t-menu__operations-icon s" />
                    <NotificationFilledIcon class="t-menu__operations-icon s" />
                    <t-dropdown class="s"  @click="userRoleChange" :options="userRolesSelect">
                        <t-space>
                            <t-button variant="text">
                            <template #icon><ChartBubbleIcon size="16" /></template>
                            {{ currentRoleName}}
                            <template #suffix><ChevronDownIcon size="16" /></template>
                            </t-button>
                        </t-space>
                    </t-dropdown>
                    <t-dropdown class="s"  @click="dropdownClick" :options="dropdownOption">
                        <t-space>
                            <t-button variant="text">
                            <template #icon><UserCircleIcon size="16" /></template>
                            {{ current.user.number }}
                            <template #suffix><ChevronDownIcon size="16" /></template>
                            </t-button>
                        </t-space>
                    </t-dropdown>
                    <HomeIcon @click="toHome" class="t-menu__operations-icon s"   />
                    
                    <FormatVerticalAlignRightIcon v-if="!menuVisible" @click="menuVisible = true" class="menu-button"  />
                    <CloseIcon v-else  @click="closeMenu" class="menu-button" />
                </template>
            </t-head-menu>
        </t-header>
        <t-layout style="position: relative;">
            <t-drawer
            v-model:visible="menuVisible"
            show-in-attached-element
            placement="top"
            :footer="false"
            size="70%"
        >
            <div class="drawer">
                <div class="center">
                    <t-button variant="text" value="home" theme="default" @click="router.push('/'); closeMenu()" v-if="current.user.role == UserRole.student">
                        <template #icon>
                            <DashboardIcon/>
                        </template>
                        首页
                    </t-button>
                    <t-button variant="text" value="anno" theme="default" @click="router.push('/anno'); closeMenu()">
                        <template #icon>
                            <Edit1Icon/>
                        </template>
                        {{ current.user.role == UserRole.student ? "标注" : "标注审核" }}
                    </t-button>
                    <t-button variant="text" value="task" theme="default" @click="router.push('/task'); closeMenu()" v-if="current.user.role == UserRole.teacher">
                        <template #icon>
                            <ServerIcon/>
                        </template>
                        任务管理
                    </t-button>
                    <t-button variant="text" value="check" theme="default" @click="router.push('/check'); closeMenu()" v-if="current.user.role == UserRole.teacher">
                        <template #icon>
                            <FilterClearIcon />
                        </template>
                        审核员管理
                    </t-button>
                    <t-button variant="text" value="student" theme="default" @click="router.push('/student'); closeMenu()" v-if="current.user.role == UserRole.teacher">
                        <template #icon>
                            <UserCircleIcon />
                        </template>
                        学生管理
                    </t-button>
                    <t-button variant="text" value="option" theme="default" @click="router.push('/option'); closeMenu()" v-if="current.user.role == UserRole.teacher">
                        <template #icon>
                            <SettingIcon />
                        </template>
                        全局设置
                    </t-button>
                    <t-button class="color" @click="modeChange()" theme="default">
                        {{ lightMode ? '深色模式' : '浅色模式' }}
                    </t-button>
                    <t-button v-for="r in userRolesSelect" @click="userRoleChange(r)" variant="text" theme="default">
                        <template #icon><ChartBubbleIcon size="16" /></template>
                        {{ r.content }}
                    </t-button>
                    <t-button @click="logout" variant="text" theme="default">
                        <template #icon><UserCircleIcon size="16" /></template>
                        退出登录
                    </t-button>
                </div>
            </div>
        </t-drawer>
        <t-layout class="nonTop">
            <t-aside class="aside">
                <t-menu theme="light" :default-value="currentItem" style="margin-right: 50px" router>

                    <t-menu-item value="home" v-if="current.user.role == UserRole.student" to="/">
                        <template #icon>
                            <DashboardIcon />
                        </template>
                        首页
                    </t-menu-item>
                    <t-menu-item value="anno" to="/anno">
                        <template #icon>
                            <Edit1Icon />
                        </template>
                        {{ current.user.role == UserRole.student ? "标注" : "标注审核" }}
                    </t-menu-item>
                    <t-menu-item v-if="current.user.role == UserRole.teacher" value="task" to="/task">
                        <template #icon>
                            <ServerIcon />
                        </template>
                        任务管理
                    </t-menu-item>
                    <t-menu-item v-if="current.user.role == UserRole.teacher" value="check" to="/check">
                        <template #icon>
                            <FilterClearIcon />
                        </template>
                        审核员管理
                    </t-menu-item>
                    <t-menu-item v-if="current.user.role == UserRole.teacher" value="student" to="/student">
                        <template #icon>
                            <UserCircleIcon />
                        </template>
                        学生管理
                    </t-menu-item>
                    <t-menu-item v-if="current.user.role == UserRole.teacher" value="option" to="/option">
                        <template #icon>
                            <SettingIcon />
                        </template>
                        全局设置
                    </t-menu-item>
                </t-menu>
            </t-aside>
            <t-layout>
                <RouterView class="content" v-slot="{ Component }">
                    <!--也可以加到路由元信息中-->
                    <keep-alive :include="['home', 'check', 'student', 'option', 'task']">
                        <component :is="Component"/>
                    </keep-alive>
                </RouterView>
                <t-footer class="copy" style="user-select: none; display: flex; justify-content: center;">Copyright @ 2023-{{
                    new
                        Date().getFullYear()
                }}
                    China Pharmaceutical University. All Rights
                    Reserved.</t-footer>
            </t-layout>
        </t-layout>
        </t-layout>
    </t-layout>
</template>

<style scoped lang='less'>
.root {
    height: 100vh;
}

.nonTop {
    margin-top: 2px;
}

.content {
    margin: 20px 20px 0 20px;
    height: auto;
    background-color: var(--base-bgc);
}

.menu-button {
    display: none;
}

.drawer {
    border-top: 1px solid #eee;
    display: flex;
    justify-content: center;
    
    .center {
        width: 80%;
        padding: 20px 0;

        button {
            width: 100%;
        }

        .color {
            margin: 20px 0;
        }
    }
}

@media screen and (max-width: 900px) {
    .aside, .s {
        display: none;
    }

    .copy {
        display: none !important;
    }

    .menu-button {
        display: block;
        margin-right: 15px;
    }

    .content {
        margin: 0;
    }

    .nonTop {
        margin: 0;
        border-top: 1px solid #eee;
    }
}
</style>