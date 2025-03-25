// src/services/index.ts
import apiClient from './apiClient';
import authService from './authService';
import userService from './userService';
import projectService from './projectService';
import periodService from './periodService';
import fileService from './fileService';
import assignmentService from './assignmentService';

// Exportar todos los servicios desde un solo punto
export {
  apiClient,
  authService,
  userService,
  projectService,
  periodService,
  fileService,
  assignmentService
};
