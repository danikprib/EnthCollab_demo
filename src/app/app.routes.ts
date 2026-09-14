import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile';
import { HomePage } from './home-page/home-page';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { ProjectPage } from './project-page/project-page';

export const routes: Routes = [

    {
        path: '',
        component: HomePage,
        title: 'Home Page'
    },
    {
        path: 'login',
        component: Login,
        title: 'Log In'
    },
    {
        path: 'signup',
        component: Signup,
        title: 'Sign Up'
    },
    {
        path: 'user',
        component: UserProfile,
        title: 'User Profile'
    },
    {
        path: 'project/:projectId',
        component: ProjectPage,
        title: 'Project Page'
    }
    



];
