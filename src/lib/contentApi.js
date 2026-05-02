import { MEDIA_BUCKET, supabase } from "./supabase";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

function safeFileName(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function mediaFromRows(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    name: row.file_name,
    filePath: row.file_path,
    url: row.public_url,
  }));
}

export async function getSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithEmail(email) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname,
    },
  });

  if (error) throw error;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function loadContent() {
  const client = requireSupabase();

  const [essaysResult, photosResult] = await Promise.all([
    client
      .from("essays")
      .select("id,title,category,body,created_at,essay_media(id,type,file_path,public_url,file_name)")
      .order("created_at", { ascending: false }),
    client
      .from("photos")
      .select("id,category,file_path,public_url,file_name,created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (essaysResult.error) throw essaysResult.error;
  if (photosResult.error) throw photosResult.error;

  return {
    essays: essaysResult.data.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      body: row.body,
      createdAt: row.created_at,
      media: mediaFromRows(row.essay_media),
    })),
    photos: photosResult.data.map((row) => ({
      id: row.id,
      name: row.file_name,
      category: row.category,
      filePath: row.file_path,
      url: row.public_url,
      createdAt: row.created_at,
    })),
  };
}

async function uploadFile(folder, file) {
  const client = requireSupabase();
  const path = `${folder}/${crypto.randomUUID()}-${safeFileName(file.name) || "file"}`;

  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw error;

  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return {
    filePath: path,
    publicUrl: data.publicUrl,
  };
}

export async function createEssay({ title, category, body, imageFiles, audioFile }) {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;

  const { data: essay, error: essayError } = await client
    .from("essays")
    .insert({
      title,
      category,
      body,
      owner_id: userData.user.id,
    })
    .select("id,title,category,body,created_at")
    .single();

  if (essayError) throw essayError;

  const mediaRows = [];
  for (const file of imageFiles) {
    const uploaded = await uploadFile(`essays/${essay.id}/images`, file);
    mediaRows.push({
      essay_id: essay.id,
      type: "image",
      file_path: uploaded.filePath,
      public_url: uploaded.publicUrl,
      file_name: file.name,
    });
  }

  if (audioFile) {
    const uploaded = await uploadFile(`essays/${essay.id}/audio`, audioFile);
    mediaRows.push({
      essay_id: essay.id,
      type: "audio",
      file_path: uploaded.filePath,
      public_url: uploaded.publicUrl,
      file_name: audioFile.name,
    });
  }

  if (mediaRows.length) {
    const { error: mediaError } = await client.from("essay_media").insert(mediaRows);
    if (mediaError) throw mediaError;
  }

  return {
    id: essay.id,
    title: essay.title,
    category: essay.category,
    body: essay.body,
    createdAt: essay.created_at,
    media: mediaRows.map((row) => ({
      type: row.type,
      name: row.file_name,
      filePath: row.file_path,
      url: row.public_url,
    })),
  };
}

export async function deleteEssay(essay) {
  const client = requireSupabase();
  const paths = essay.media?.map((item) => item.filePath).filter(Boolean) || [];

  if (paths.length) {
    const { error: storageError } = await client.storage.from(MEDIA_BUCKET).remove(paths);
    if (storageError) throw storageError;
  }

  const { error } = await client.from("essays").delete().eq("id", essay.id);
  if (error) throw error;
}

export async function uploadPhotos({ files, category }) {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;

  const rows = [];
  for (const file of files) {
    const uploaded = await uploadFile(`photos/${category}`, file);
    rows.push({
      category,
      file_path: uploaded.filePath,
      public_url: uploaded.publicUrl,
      file_name: file.name,
      owner_id: userData.user.id,
    });
  }

  const { data, error } = await client
    .from("photos")
    .insert(rows)
    .select("id,category,file_path,public_url,file_name,created_at");

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.file_name,
    category: row.category,
    filePath: row.file_path,
    url: row.public_url,
    createdAt: row.created_at,
  }));
}

export async function deletePhoto(photo) {
  const client = requireSupabase();

  if (photo.filePath) {
    const { error: storageError } = await client.storage
      .from(MEDIA_BUCKET)
      .remove([photo.filePath]);
    if (storageError) throw storageError;
  }

  const { error } = await client.from("photos").delete().eq("id", photo.id);
  if (error) throw error;
}
