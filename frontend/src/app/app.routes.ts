import { Routes } from '@angular/router';
import { Profile } from './pages/profile/profile';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { Project } from './pages/project/project';
import { CreateProject } from './pages/create-project/create-project';
import { Agent } from './pages/agent/agent';
import { Projects } from './pages/projects/projects';
import { Users } from './pages/users/users';
import { User } from './pages/user/user';



export const routes: Routes = [

    {
        path: '',
        component: Home,
        title: 'Home Page'
    },
    {
        path: 'login',
        component: Login,
        title: 'Log In'
    },
    {
        path: 'users',
        component: Users,
        title: 'Users'
    },
    {
        path: 'users/:userId',
        component: User,
        title: 'User Page'
    },
    {
        path: 'signup',
        component: Signup,
        title: 'Sign Up'
    },
        {
        path: 'agent',
        component: Agent,
        title: 'Agent'
    },
    {
        path: 'profile',
        component: Profile,
        title: 'My Profile'
    },
    {
        path: 'project/:projectId',
        component: Project,
        title: 'Project Page'
    },
    {
        path: 'create-project',
        component: CreateProject,
        title: 'Create Project'
    },
    // {
    //     path: 'chats',
    //     loadComponent: () => import('./pages/chats/chats').then(m => m.Chats),
    //     children: [
    //         {
    //             path: ':id',
    //             loadComponent: () => import('./pages/chat/chat').then(m => m.Chat)
    //         }
    //     ],
    //     title: 'Chats'
    // },
    {
        path: 'projects',
        component: Projects,
        title: 'Projects'
    },

];
