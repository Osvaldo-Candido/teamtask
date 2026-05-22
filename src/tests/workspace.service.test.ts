import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryWorkspaceRepository } from "../repositories/InMemoryWorkspaceRepository.js";
import { InMemoryUserRepository } from "../repositories/in-memory-user.repository.js";
import { WorkspaceServices } from "../services/workspaces.js";
import { hashPassword } from "../auth.js";

describe('workspaceServices', () => {
  let repo:InMemoryWorkspaceRepository
  let userRepo:InMemoryUserRepository
  let service:WorkspaceServices

  beforeEach(()=>{
    repo = new InMemoryWorkspaceRepository()
    userRepo = new InMemoryUserRepository()
    service = new WorkspaceServices(repo, userRepo)
  })

  describe('Criar workspace', () => {
    it('deve criar e atribuir OWNER ao criador', async () => {
      const result = await service.createWorkspace('user-1', {
        name: 'Meu workspace',
        description: 'Descrição do meu workspace'
      })

      expect(result.workspace.name).toBe('Meu workspace')
      expect(result.member.userId).toBe('user-1')
      expect(result.member.role).toBe('OWNER')
    })
  })

  describe('update workspace', ()=>{
    it('OWNER deve conseguir editar workspace', async () => {
     
      const {workspace} = await service.createWorkspace('user-1',{
        name: 'workspace test',
        description: 'workspace de test'
      })

      const workspaceUpdated = await service.updateWorkspace(workspace.id, 'user-1', {
        name:'actualizado'
      })

      expect(workspaceUpdated?.name).toBe('actualizado')
    })

    it('MEMBER não consegui editar workspace', async () => {
      const {workspace} = await service.createWorkspace('user-1',{
        name:'workspace'
      })
      repo.addMember({
        id: 'member-1',
        userId: 'user-2',
        role: 'MEMBER',
        joinedAt: new Date(),
        workspaceId: workspace.id
      })

      await expect(service.updateWorkspace(workspace.id, 'user-2',{
        name:'workspace actualizado'
      })).rejects.toThrow('Sem permissão para editar workspace')
    })

    it('MEMBER deve conseguir ver workspace', async () => {
      const {workspace} = await service.createWorkspace('user-1', {
        name:'Novo workspace'
      })

      repo.addMember({
        id: 'member-1',
        userId: 'user-2',
        role: 'MEMBER',
        joinedAt: new Date(),
        workspaceId: workspace.id
      })

      const result = await service.findWorkspace('user-2',workspace.id)

      expect(result?.name).toBe('Novo workspace')
    })

    it('MEMBER sem releção não deve conseguir ver o workspace', async () => {
      const {workspace} = await service.createWorkspace('user-1',{
        name: 'workspace'
      })

      repo.addMember({
        id: 'member-1',
        userId: 'user-2',
        role: 'MEMBER',
        joinedAt: new Date(),
        workspaceId: 'workspace-345'
      })

      await expect(service.findWorkspace('user-2', workspace.id)).
      rejects.toThrow()

    })
  })
})