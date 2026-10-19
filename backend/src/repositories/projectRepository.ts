import { db } from '../db/database';
import type { Project, ProjectFile, ProjectLink, TeamMember } from '../models/project';

export class ProjectRepository {
  static create(project: Omit<Project, 'createdAt' | 'updatedAt'>): Project {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO projects (
        id, name, architecture_type, category, domain, tagline,
        problem_statement, solution_description, team_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        architecture_type = excluded.architecture_type,
        category = excluded.category,
        domain = excluded.domain,
        tagline = COALESCE(excluded.tagline, projects.tagline),
        problem_statement = excluded.problem_statement,
        solution_description = excluded.solution_description,
        team_name = excluded.team_name,
        updated_at = excluded.updated_at`,
      project.id,
      project.name,
      project.architectureType,
      project.category,
      project.domain,
      project.tagline || null,
      project.problemStatement || '',
      project.solutionDescription || '',
      project.teamName || 'Engineering Research Team',
      now,
      now
    );

    if (project.teamMembers && project.teamMembers.length > 0) {
      for (const m of project.teamMembers) {
        db.run(
          `INSERT INTO team_members (id, project_id, name, role, email, avatar_url) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             role = excluded.role,
             email = excluded.email,
             avatar_url = excluded.avatar_url`,
          m.id,
          project.id,
          m.name,
          m.role,
          m.email || null,
          m.avatarUrl || null
        );
      }
    }

    if (project.links && project.links.length > 0) {
      for (const l of project.links) {
        db.run(
          `INSERT INTO project_links (id, project_id, type, url, description) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             type = excluded.type,
             url = excluded.url,
             description = excluded.description`,
          l.id,
          project.id,
          l.type,
          l.url,
          l.description || null
        );
      }
    }

    return this.findById(project.id)!;
  }

  static findById(id: string): Project | undefined {
    let row = db.get<any>(`SELECT * FROM projects WHERE id = ?`, id);
    if (!row) {
      // Fallback: Check if the provided id is an evaluation id
      const evalRow = db.get<any>(`SELECT project_id FROM evaluations WHERE id = ?`, id);
      if (evalRow?.project_id) {
        row = db.get<any>(`SELECT * FROM projects WHERE id = ?`, evalRow.project_id);
        id = evalRow.project_id;
      }
    }
    if (!row) return undefined;

    const teamMembers = db.all<TeamMember>(`SELECT * FROM team_members WHERE project_id = ?`, id);
    const files = db.all<any>(`SELECT * FROM project_files WHERE project_id = ?`, id).map(f => ({
      id: f.id,
      projectId: f.project_id,
      fileName: f.file_name,
      fileType: f.file_type,
      fileSizeBytes: f.file_size_bytes,
      mimeType: f.mime_type,
      storagePath: f.storage_path,
      uploadedAt: f.uploaded_at,
    }));
    const links = db.all<ProjectLink>(`SELECT * FROM project_links WHERE project_id = ?`, id);

    return {
      id: row.id,
      name: row.name,
      architectureType: row.architecture_type,
      category: row.category,
      domain: row.domain,
      tagline: row.tagline || undefined,
      problemStatement: row.problem_statement,
      solutionDescription: row.solution_description,
      teamName: row.team_name,
      teamMembers,
      files,
      links,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static findAll(): Project[] {
    const rows = db.all<any>(`SELECT id FROM projects ORDER BY created_at DESC`);
    return rows.map(r => this.findById(r.id)!).filter(Boolean);
  }

  static update(id: string, updates: Partial<Project>): Project | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    db.run(
      `UPDATE projects SET
        name = COALESCE(?, name),
        architecture_type = COALESCE(?, architecture_type),
        category = COALESCE(?, category),
        domain = COALESCE(?, domain),
        tagline = COALESCE(?, tagline),
        problem_statement = COALESCE(?, problem_statement),
        solution_description = COALESCE(?, solution_description),
        team_name = COALESCE(?, team_name),
        updated_at = ?
      WHERE id = ?`,
      updates.name || null,
      updates.architectureType || null,
      updates.category || null,
      updates.domain || null,
      updates.tagline || null,
      updates.problemStatement || null,
      updates.solutionDescription || null,
      updates.teamName || null,
      now,
      id
    );

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const res = db.run(`DELETE FROM projects WHERE id = ?`, id);
    return Number(res.changes) > 0;
  }

  static addFile(file: ProjectFile): void {
    db.run(
      `INSERT INTO project_files (
        id, project_id, file_name, file_type, file_size_bytes, mime_type, storage_path, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      file.id,
      file.projectId,
      file.fileName,
      file.fileType,
      file.fileSizeBytes,
      file.mimeType,
      file.storagePath,
      file.uploadedAt || new Date().toISOString()
    );
  }

  static addLink(link: ProjectLink): void {
    db.run(
      `INSERT INTO project_links (id, project_id, type, url, description) VALUES (?, ?, ?, ?, ?)`,
      link.id,
      link.projectId,
      link.type,
      link.url,
      link.description || null
    );
  }
}
