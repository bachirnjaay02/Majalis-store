import { useState } from "react";

export default function UsersPage({ users, orders }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <span>🔍</span>
          <input placeholder="Rechercher un utilisateur…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Commandes</th>
              <th>Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{u.name[0]}</div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--text2)" }}>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <span className={`role-tag ${u.role === "admin" ? "role-admin" : "role-client"}`}>
                    {u.role === "admin" ? "👑 Admin" : "👤 Client"}
                  </span>
                </td>
                <td>{orders.filter((o) => o.clientId === u.id).length}</td>
                <td style={{ color: "var(--text2)", fontSize: 12 }}>{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
